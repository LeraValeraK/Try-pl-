import { useState, useCallback } from 'react';
import {
  validateManifest, fetchManifest,
  getThumbnail, parseCSV,
} from '../iiif.js';

export function useItems() {
  const [items, setItems]     = useState([]);
  const [source, setSource]   = useState('');
  const [version, setVersion] = useState('');
  const [busy, setBusy]       = useState(false);

  const patch = useCallback((id, fields) =>
    setItems((prev) => prev.map((it) => it.id === id ? { ...it, ...fields } : it)), []);

  // Validate + fetch a single item
  const runOne = useCallback(async (item) => {
    patch(item.id, { status: 'loading' });
    const [result, manifest] = await Promise.all([
      validateManifest(item.url, version),
      fetchManifest(item.url),
    ]);
    const errors   = result?.errors   || [];
    const warnings = result?.warnings || [];
    const status   = result?.okay === 1
      ? (warnings.length ? 'warn' : 'ok')
      : 'err';
    const thumb    = getThumbnail(manifest);
    patch(item.id, { status, result, manifest, thumbnail: thumb });
  }, [version, patch]);

  // Validate all that haven't been checked yet
  const validateAll = useCallback(async (targetItems) => {
    setBusy(true);
    const pending = (targetItems ?? items).filter(
      (i) => i.status === 'pending' || i.status === 'err'
    );
    for (const item of pending) await runOne(item);
    setBusy(false);
  }, [items, runOne]);

  // Load a single URL
  const loadUrl = useCallback((url) => {
    if (!url.trim()) return;
    const item = {
      id: 'single-0', name: 'Manifest',
      url: url.trim(), group: 'Collection',
      status: 'pending', result: null, manifest: null, thumbnail: null,
    };
    setItems([item]);
    setSource(url.trim());
    return item;
  }, []);

  // Load CSV text
  const loadCSV = useCallback((text, fileName) => {
    const parsed = parseCSV(text);
    if (!parsed.length) return null;
    setItems(parsed);
    setSource(fileName || 'upload.csv');
    return parsed;
  }, []);

  // Group items by .group
  const groups = items.reduce((acc, it) => {
    (acc[it.group] = acc[it.group] || []).push(it);
    return acc;
  }, {});

  return {
    items, groups, source, version, busy,
    setVersion, runOne, validateAll, loadUrl, loadCSV,
  };
}
