import { useRef, useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { exportBackup, importBackup } from '../backup/backup.service';

export function BackupPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState('');

  return (
    <>
      <PageHeader title="Backup" subtitle="Exporte ou importe seus dados se reinstalar o app" />
      <div className="card">
        <div className="stack">
          <button className="btn primary" onClick={() => exportBackup().then(() => setStatus('Backup exportado com sucesso.'))}>Exportar backup JSON</button>
          <button className="btn secondary" onClick={() => inputRef.current?.click()}>Importar backup JSON</button>
          <input
            ref={inputRef}
            type="file"
            accept="application/json"
            hidden
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              await importBackup(file);
              setStatus('Backup importado com sucesso.');
            }}
          />
          {status ? <div className="small">{status}</div> : null}
        </div>
      </div>
    </>
  );
}
