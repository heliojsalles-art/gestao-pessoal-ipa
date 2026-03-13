import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { readDb, replaceDb } from '../db/storage';
import type { AppBackup } from '../types/models';

function isNative() {
  return Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android';
}

export async function exportBackup() {
  const backup = await readDb();
  const payload = JSON.stringify({ ...backup, exportedAt: new Date().toISOString(), version: 2 }, null, 2);

  if (isNative()) {
    const fileName = `gestao-pessoal-backup-${Date.now()}.json`;
    const result = await Filesystem.writeFile({
      path: fileName,
      data: payload,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
      recursive: true,
    });
    await Share.share({
      title: 'Backup do app',
      text: 'Backup completo do Gestão Pessoal',
      url: result.uri,
    });
    return;
  }

  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'gestao-pessoal-backup.json';
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function importBackup(file: File) {
  const payload = JSON.parse(await file.text()) as AppBackup;
  if (payload.version !== 2) throw new Error('Versão de backup incompatível.');
  await replaceDb(payload);
}
