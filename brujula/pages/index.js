import Head from 'next/head'
import { useState } from 'react'

function getImage(hint) {
  if (!hint) return 'https://picsum.photos/seed/emotion/600/320'
  const slug = hint.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  return `https://picsum.photos/seed/${slug}/600/320`
}

export default function Home() {
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [feeling, setFeeling] = useState('')
  const [situation, setSituation] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})

  function validate() {
    const e = {}
    if (!name.trim() || name.trim().length < 2) e.name = 'Por favor ingresa tu nombre (mín. 2 caracteres).'
    if (!age || isNaN(age) || +age < 1 || +age > 120) e.age = 'Por favor ingresa una edad válida.'
    if (!feeling.trim() || feeling.trim().length < 10) e.feeling = 'Describe tu emoción con al menos 10 caracteres.'
    if (!situation.trim() || situation.trim().length < 3) e.situation = 'Describe brevemente dónde estás.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function analyze() {
    setError('')
    if (!validate()) return
    setLoading(true)
    setResult(null)

    const systemPrompt = `Eres un psicólogo emocional experto y compasivo. 
Analiza la situación emocional del usuario y responde ÚNICAMENTE con un JSON válido (sin markdown, sin backticks) con esta estructura exacta:
{
  "detectedEmotion": "nombre corto de la emoción detectada (ej: Ansiedad, Tristeza, Estrés)",
  "emotionManagement": "párrafo de 2-3 oraciones sobre cómo gestionar esta emoción específica",
  "emotionManagementImageHint": "2-3 palabras en inglés describiendo una imagen serena relacionada (ej: calm ocean breath)",
  "immediateActions": "párrafo de 2-3 oraciones con acciones concretas que puede hacer AHORA mismo dado su contexto",
  "immediateActionsImageHint": "2-3 palabras en inglés para imagen de acción positiva (ej: walk park morning)",
  "thingsToAvoid": "párrafo de 2-3 oraciones sobre qué evitar o considerar en esta situación",
  "thingsToAvoidImageHint": "2-3 palabras en inglés para imagen que simbolice pausa o reflexión (ej: pause red light)"
}
Adapta el tono y las recomendaciones a la edad del usuario. Sé empático, práctico y esperanzador.`

    const userMsg = `Mi nombre es ${name}, tengo ${age} años.\nEmoción/Situación: ${feeling}\nDónde estoy: ${situation}`

    try {
      const resp = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: systemPrompt,
          messages: [{ role: 'user', content: userMsg }],
        }),
      })

      const data = await resp.json()
      if (data.error) throw new Error(data.error)

      const raw = data.content?.[0]?.text || ''
      let parsed
      try {
        parsed = JSON.parse(raw)
      } catch {
        const match = raw.match(/\{[\s\S]*\}/)
        if (match) parsed = JSON.parse(match[0])
        else throw new Error('Respuesta inesperada de la IA. Intenta de nuevo.')
      }
      setResult(parsed)
    } catch (err) {
      setError('⚠ ' + (err.message || 'Error al conectar con la IA.'))
    } finally {
      setLoading(false)
    }
  }

  const cards = result ? [
    { cls: 'card-manage', accent: '#4ECDC4', dimColor: 'rgba(78,205,196,0.12)', icon: '🧠', title: '¿Cómo gestionar mi emoción?', text: result.emotionManagement, emotion: result.detectedEmotion, imgHint: result.emotionManagementImageHint },
    { cls: 'card-action', accent: '#FFB347', dimColor: 'rgba(255,179,71,0.12)',  icon: '⚡', title: '¿Qué puedo hacer ahora?',    text: result.immediateActions,   imgHint: result.immediateActionsImageHint },
    { cls: 'card-avoid',  accent: '#FF6B8A', dimColor: 'rgba(255,107,138,0.12)', icon: '🚫', title: '¿Qué debería evitar?',       text: result.thingsToAvoid,      imgHint: result.thingsToAvoidImageHint },
  ] : []

  return (
    <>
      <Head>
        <title>Emoción IA — Tu Brújula Emocional</title>
        <meta name="description" content="Describe lo que sientes y recibe orientación personalizada con IA para navegar tus emociones." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        :root{--bg:#0E1117;--surface:#161B26;--surface2:#1E2535;--border:rgba(255,255,255,0.07);--text:#E8EAF0;--muted:rgba(232,234,240,0.5);--teal:#4ECDC4;--amber:#FFB347;--rose:#FF6B8A}
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;overflow-x:hidden}

        .bg-orbs{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden}
        .orb{position:absolute;border-radius:50%;filter:blur(80px);opacity:.18;animation:drift 18s ease-in-out infinite}
        .orb-1{width:500px;height:500px;background:var(--teal);top:-150px;left:-100px;animation-delay:0s}
        .orb-2{width:400px;height:400px;background:var(--amber);bottom:-100px;right:-80px;animation-delay:-6s}
        .orb-3{width:300px;height:300px;background:var(--rose);top:40%;left:50%;animation-delay:-12s}
        @keyframes drift{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-20px) scale(1.05)}66%{transform:translate(-20px,30px) scale(.95)}}

        .wrap{position:relative;z-index:1;max-width:900px;margin:0 auto;padding:60px 24px 100px}

        header{text-align:center;margin-bottom:56px;animation:fadeUp .8s ease both}
        .header-badge{display:inline-flex;align-items:center;gap:8px;font-size:.7rem;letter-spacing:.22em;text-transform:uppercase;color:var(--teal);border:1px solid rgba(78,205,196,.3);padding:6px 16px;margin-bottom:24px}
        .header-badge::before{content:'◈';font-size:.6rem}
        h1{font-family:'Playfair Display',serif;font-size:clamp(2.4rem,6vw,4rem);font-weight:600;line-height:1.1;margin-bottom:16px}
        h1 em{font-style:italic;color:var(--teal)}
        .header-sub{font-size:1rem;color:var(--muted);font-weight:300;line-height:1.7;max-width:480px;margin:0 auto}

        .form-card{background:var(--surface);border:1px solid var(--border);padding:48px 40px;margin-bottom:40px;position:relative;overflow:hidden;animation:fadeUp .8s .2s ease both}
        .form-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(to right,transparent,var(--teal),transparent)}

        .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px}
        .form-group{display:flex;flex-direction:column;gap:8px}
        .form-group.full{grid-column:1/-1}
        label{font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);font-weight:500}
        input,textarea{background:var(--surface2);border:1px solid var(--border);color:var(--text);font-family:'DM Sans',sans-serif;font-size:.95rem;padding:14px 16px;outline:none;transition:border-color .25s,box-shadow .25s;width:100%}
        input:focus,textarea:focus{border-color:rgba(78,205,196,.5);box-shadow:0 0 0 3px rgba(78,205,196,.08)}
        input::placeholder,textarea::placeholder{color:rgba(232,234,240,.25)}
        textarea{resize:none;min-height:110px}
        .field-err{font-size:.75rem;color:var(--rose);margin-top:2px}
        .inp-err{border-color:rgba(255,107,138,.5) !important}

        .status-banner{padding:16px 20px;margin-bottom:24px;font-size:.85rem;border:1px solid rgba(255,107,138,.3);background:rgba(255,107,138,.08);color:var(--rose)}
        .status-banner.ok{border-color:rgba(78,205,196,.3);background:rgba(78,205,196,.08);color:var(--teal)}

        .btn-submit{width:100%;padding:16px;background:var(--teal);color:#0E1117;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:.9rem;font-weight:500;letter-spacing:.12em;text-transform:uppercase;transition:background .25s,transform .2s,box-shadow .25s;display:flex;align-items:center;justify-content:center;gap:10px}
        .btn-submit:hover:not(:disabled){background:#5EDDD4;transform:translateY(-1px);box-shadow:0 8px 24px rgba(78,205,196,.3)}
        .btn-submit:disabled{opacity:.6;cursor:not-allowed}

        .spinner{width:18px;height:18px;border:2px solid rgba(14,17,23,.3);border-top-color:#0E1117;border-radius:50%;animation:spin .7s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}

        .skel-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:40px}
        .skel-card{background:var(--surface);border:1px solid var(--border);padding:28px;height:320px}
        .skel{background:linear-gradient(90deg,var(--surface2) 25%,var(--surface) 50%,var(--surface2) 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;border-radius:2px}
        .skel-icon{width:40px;height:40px;border-radius:50%;margin-bottom:20px}
        .skel-title{height:20px;width:70%;margin-bottom:20px}
        .skel-line{height:12px;margin-bottom:10px}
        .skel-short{width:60%}
        @keyframes shimmer{to{background-position:-200% 0}}

        .results-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;animation:fadeUp .6s ease both}
        .result-card{background:var(--surface);border:1px solid var(--border);overflow:hidden;display:flex;flex-direction:column;transition:transform .3s,box-shadow .3s}
        .result-card:hover{transform:translateY(-4px)}
        .card-head{padding:24px 24px 16px;display:flex;align-items:flex-start;gap:14px}
        .card-icon{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:1.1rem}
        .card-title{font-family:'Playfair Display',serif;font-size:1rem;font-weight:600;line-height:1.3;color:var(--text)}
        .card-body{padding:0 24px 20px;font-size:.85rem;line-height:1.8;color:var(--muted);flex-grow:1}
        .card-img-wrap{height:160px;overflow:hidden;flex-shrink:0;position:relative}
        .card-img-wrap img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
        .result-card:hover .card-img-wrap img{transform:scale(1.05)}
        .card-img-wrap::after{content:'';position:absolute;bottom:0;left:0;right:0;height:60px;background:linear-gradient(to top,var(--surface),transparent)}
        .emotion-chip{display:inline-block;font-size:.7rem;letter-spacing:.15em;text-transform:uppercase;padding:3px 10px;margin-bottom:8px;border:1px solid rgba(255,255,255,.08)}

        footer{text-align:center;padding-top:60px;font-size:.72rem;letter-spacing:.1em;color:rgba(232,234,240,.25);position:relative;z-index:1}
        footer a{color:var(--teal);text-decoration:none}

        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @media(max-width:768px){.form-card{padding:28px 20px}.form-grid{grid-template-columns:1fr}.skel-grid,.results-grid{grid-template-columns:1fr}h1{font-size:2.2rem}}
      `}</style>

      <div className="bg-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <div className="wrap">
        <header>
          <div className="header-badge">Powered by Claude AI</div>
          <h1>Tu <em>brújula</em><br />emocional</h1>
          <p className="header-sub">Describe lo que sientes y recibe orientación personalizada para navegar tus emociones con inteligencia.</p>
        </header>

        {error && <div className="status-banner">{error}</div>}

        <div className="form-card">
          <div className="form-grid">
            <div className="form-group">
              <label>Tu nombre</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Alex" className={errors.name ? 'inp-err' : ''} />
              {errors.name && <span className="field-err">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label>Tu edad</label>
              <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="Ej: 28" min="1" max="120" className={errors.age ? 'inp-err' : ''} />
              {errors.age && <span className="field-err">{errors.age}</span>}
            </div>
            <div className="form-group full">
              <label>¿Qué estás sintiendo o cuál es tu situación emocional?</label>
              <textarea value={feeling} onChange={e => setFeeling(e.target.value)} placeholder="Ej: Me siento ansioso por una presentación importante mañana..." className={errors.feeling ? 'inp-err' : ''} />
              {errors.feeling && <span className="field-err">{errors.feeling}</span>}
            </div>
            <div className="form-group full">
              <label>¿Dónde te encuentras ahora?</label>
              <input value={situation} onChange={e => setSituation(e.target.value)} placeholder="Ej: En la oficina, a punto de entrar a la reunión" className={errors.situation ? 'inp-err' : ''} />
              {errors.situation && <span className="field-err">{errors.situation}</span>}
            </div>
          </div>

          <button className="btn-submit" onClick={analyze} disabled={loading}>
            {loading ? <><div className="spinner" />Analizando...</> : '✦ Analizar mi emoción'}
          </button>
        </div>

        {loading && (
          <div className="skel-grid">
            {[0,1,2].map(i => (
              <div key={i} className="skel-card">
                <div className="skel skel-icon" />
                <div className="skel skel-title" />
                <div className="skel skel-line" />
                <div className="skel skel-line" />
                <div className="skel skel-line skel-short" />
              </div>
            ))}
          </div>
        )}

        {result && (
          <div className="results-grid">
            {cards.map((c, i) => (
              <div key={i} className="result-card" style={{ borderTop: `2px solid ${c.accent}` }}>
                <div className="card-head">
                  <div className="card-icon" style={{ background: c.dimColor }}>{c.icon}</div>
                  <div>
                    {c.emotion && (
                      <div className="emotion-chip" style={{ background: c.dimColor, color: c.accent }}>{c.emotion}</div>
                    )}
                    <div className="card-title">{c.title}</div>
                  </div>
                </div>
                <div className="card-body">{c.text}</div>
                <div className="card-img-wrap">
                  <img
                    src={getImage(c.imgHint)}
                    alt={c.imgHint || 'emotion'}
                    loading="lazy"
                    onError={e => { e.target.src = 'https://picsum.photos/seed/emotion-default/600/320' }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer>
        <p>Aplicación de portafolio · IA con Claude · por <a href="#">Ignacio Briceño</a></p>
      </footer>
    </>
  )
}
