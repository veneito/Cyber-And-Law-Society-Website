import { useCaseRefresh } from './useCaseRefresh';
import { FIELDS, GROUPS, confirmed, getAnswer, nextLead, setAnswer } from './caseFile';

export function CaseFilePanel() {
  useCaseRefresh();
  const lead = nextLead();
  const done = FIELDS.filter(confirmed).length;
  return <div className="case-file">
    <p className="case-lead" role="status">{lead ? <><b>NEXT LEAD</b> {lead.label}. {lead.hint}</> : <>Nothing open is missing. Keep investigating to unlock more.</>}<small>{done}/{FIELDS.length} confirmed</small></p>
    {GROUPS.map(group => {
      const fields = FIELDS.filter(field => field.group === group);
      return <section key={group}><h3>{group}<small>{fields.filter(confirmed).length}/{fields.length}</small></h3>
        {fields.map(field => {
          const open = field.open(), ok = confirmed(field), value = getAnswer(field.id);
          return <div key={field.id} className={`case-row ${ok ? 'case-ok' : ''} ${open ? '' : 'case-locked'}`}>
            <label htmlFor={`case-${field.id}`}>{open ? field.label : '???'}</label>
            <div><input id={`case-${field.id}`} value={open ? value : ''} disabled={!open} placeholder={open ? '' : field.lock || 'Locked'} spellCheck={false} autoComplete="off" onChange={e => setAnswer(field.id, e.target.value)} /><span aria-label={ok ? 'Confirmed' : open && value ? 'Does not match the evidence' : 'Empty'}>{ok ? '✓' : open && value ? '✗' : open ? '·' : '🔒'}</span></div>
            {open && !ok && <small>{field.hint}</small>}
          </div>;
        })}
      </section>;
    })}
  </div>;
}
