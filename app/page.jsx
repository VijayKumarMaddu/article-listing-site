"use client";
import { useState, useEffect, useCallback } from "react";

const CATEGORIES = ["Science","Environment","Architecture","Technology","Politics","Culture","Health","Business"];

const formatDisplay = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric", timeZone:"UTC" });
};

const EMPTY_FORM = { title:"", date:"", category:"Science", author:"", summary:"", image:"", paragraphs:["","",""] };

/* ── API helpers ── */
const api = {
  getAll:   ()        => fetch("/api/articles").then(r => r.json()),
  create:   (data)    => fetch("/api/articles", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(data) }).then(r => r.json()),
  update:   (id,data) => fetch(`/api/articles/${id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(data) }).then(r => r.json()),
  remove:   (id)      => fetch(`/api/articles/${id}`, { method:"DELETE" }).then(r => r.json()),
};

/* ── Toast ── */
function Toast({ msg, type }) {
  if (!msg) return null;
  return (
    <div style={{
      position:"fixed",bottom:"2rem",right:"2rem",zIndex:9999,
      background:type==="error"?"#c0392b":"#1a7a4a",
      color:"#fff",padding:"0.9rem 1.6rem",
      fontFamily:"'Source Serif 4',serif",fontSize:"0.85rem",
      letterSpacing:"0.04em",boxShadow:"0 4px 24px rgba(0,0,0,0.25)",
      animation:"slideIn 0.3s ease",
    }}>
      {msg}
    </div>
  );
}

/* ── Spinner ── */
function Spinner() {
  return (
    <div style={{display:"flex",justifyContent:"center",padding:"5rem 2rem"}}>
      <div style={{
        width:36,height:36,border:"3px solid var(--cream)",
        borderTopColor:"var(--accent)",borderRadius:"50%",
        animation:"spin 0.7s linear infinite"
      }}/>
    </div>
  );
}

/* ── Delete Modal ── */
function DeleteModal({ article, onConfirm, onCancel, loading }) {
  if (!article) return null;
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}}>
      <div style={{background:"var(--paper)",maxWidth:420,width:"100%",padding:"2.5rem",borderTop:"4px solid var(--accent)",animation:"fadeUp 0.25s ease"}}>
        <p style={{fontFamily:"'Playfair Display',serif",fontSize:"1.2rem",fontWeight:700,marginBottom:"0.8rem"}}>Delete Article?</p>
        <p style={{fontSize:"0.9rem",color:"var(--muted)",marginBottom:"2rem",lineHeight:1.6}}>
          "<strong>{article.title}</strong>" will be permanently removed.
        </p>
        <div style={{display:"flex",gap:"1rem"}}>
          <button className="btn-danger" onClick={onConfirm} disabled={loading}>{loading?"Deleting…":"Yes, Delete"}</button>
          <button className="btn-ghost" onClick={onCancel} disabled={loading}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* ── Article Form ── */
function ArticleForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(
    initial
      ? { ...initial, paragraphs: [...(initial.paragraphs || [])] }
      : { ...EMPTY_FORM, paragraphs:["","",""] }
  );
  const [errors, setErrors] = useState({});

  const set    = (key, val)  => setForm(f => ({ ...f, [key]: val }));
  const setPara = (i, val)   => setForm(f => { const p=[...f.paragraphs]; p[i]=val; return {...f,paragraphs:p}; });
  const addPara = ()         => setForm(f => ({ ...f, paragraphs:[...f.paragraphs,""] }));
  const removePara = (i)     => setForm(f => ({ ...f, paragraphs:f.paragraphs.filter((_,idx)=>idx!==i) }));

  const validate = () => {
    const e = {};
    if (!form.title.trim())   e.title = "Title is required";
    if (!form.date)           e.date  = "Date is required";
    if (!form.author.trim())  e.author = "Author is required";
    if (!form.summary.trim()) e.summary = "Summary is required";
    if (form.paragraphs.every(p => !p.trim())) e.paragraphs = "At least one paragraph is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({ ...form, paragraphs: form.paragraphs.filter(p => p.trim()) });
  };

  return (
    <div className="form-overlay">
      <div className="form-panel">
        <div className="form-header">
          <h2>{initial ? "Edit Article" : "New Article"}</h2>
          <button className="icon-btn" onClick={onCancel}>✕</button>
        </div>
        <div className="form-body">
          <div className="form-row two-col">
            <div className="field">
              <label>Title *</label>
              <input value={form.title} onChange={e=>set("title",e.target.value)} placeholder="Article headline…" />
              {errors.title && <span className="err">{errors.title}</span>}
            </div>
            <div className="field">
              <label>Author *</label>
              <input value={form.author} onChange={e=>set("author",e.target.value)} placeholder="Full name…" />
              {errors.author && <span className="err">{errors.author}</span>}
            </div>
          </div>
          <div className="form-row two-col">
            <div className="field">
              <label>Date *</label>
              <input type="date" value={form.date} onChange={e=>set("date",e.target.value)} />
              {errors.date && <span className="err">{errors.date}</span>}
            </div>
            <div className="field">
              <label>Category</label>
              <select value={form.category} onChange={e=>set("category",e.target.value)}>
                {CATEGORIES.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="field">
            <label>Cover Image URL</label>
            <input value={form.image} onChange={e=>set("image",e.target.value)} placeholder="https://…" />
            {form.image && <img src={form.image} alt="preview" style={{marginTop:"0.6rem",width:"100%",height:130,objectFit:"cover"}} onError={e=>e.target.style.display="none"} />}
          </div>
          <div className="field">
            <label>Summary * <span style={{color:"var(--muted)",fontWeight:300,textTransform:"none",letterSpacing:0}}>(shown on card)</span></label>
            <textarea rows={2} value={form.summary} onChange={e=>set("summary",e.target.value)} placeholder="One or two lines describing the article…" />
            {errors.summary && <span className="err">{errors.summary}</span>}
          </div>
          <div className="field">
            <label style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span>Paragraphs *</span>
              <button className="inline-add-btn" onClick={addPara}>+ Add paragraph</button>
            </label>
            {errors.paragraphs && <span className="err">{errors.paragraphs}</span>}
            {form.paragraphs.map((p,i) => (
              <div key={i} className="para-row">
                <span className="para-num">{i+1}</span>
                <textarea rows={4} value={p} onChange={e=>setPara(i,e.target.value)} placeholder={`Paragraph ${i+1}…`} />
                {form.paragraphs.length > 1 && <button className="remove-para-btn" onClick={()=>removePara(i)} title="Remove">✕</button>}
              </div>
            ))}
          </div>
        </div>
        <div className="form-footer">
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : (initial ? "Save Changes" : "Publish Article")}
          </button>
          <button className="btn-ghost" onClick={onCancel} disabled={saving}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* ── Admin Page ── */
function AdminPage({ articles, onCreate, onEdit, onDelete }) {
  const [showForm, setShowForm]     = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch]         = useState("");
  const [saving, setSaving]         = useState(false);
  const [deleting, setDeleting]     = useState(false);

  const filtered = articles.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.author.toLowerCase().includes(search.toLowerCase()) ||
    a.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (data) => {
    setSaving(true);
    await onCreate(data);
    setSaving(false);
    setShowForm(false);
  };
  const handleEdit = async (data) => {
    setSaving(true);
    await onEdit(editTarget.id, data);
    setSaving(false);
    setEditTarget(null);
  };
  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);
  };

  return (
    <main>
      <div className="admin-header">
        <div className="admin-header-inner">
          <div>
            <p className="section-label" style={{color:"#f5c842"}}>Content Management</p>
            <h2 className="admin-title">Editorial Desk</h2>
            <p className="admin-sub">{articles.length} article{articles.length!==1?"s":""} published</p>
          </div>
          <button className="btn-primary" onClick={()=>setShowForm(true)}>+ New Article</button>
        </div>
      </div>
      <div className="admin-body">
        <div className="admin-toolbar">
          <input className="search-input" placeholder="Search by title, author or category…" value={search} onChange={e=>setSearch(e.target.value)} />
          <span className="search-count">{filtered.length} result{filtered.length!==1?"s":""}</span>
        </div>
        {filtered.length === 0 ? (
          <div className="empty-state"><p>No articles match your search.</p></div>
        ) : (
          <div className="admin-list">
            {filtered.map((art,i) => (
              <div className={`admin-row fade-up fade-up-${Math.min(i+1,5)}`} key={art.id}>
                <div className="admin-row-img">
                  {art.image
                    ? <img src={art.image} alt="" onError={e=>e.target.style.display="none"} />
                    : <div className="img-placeholder">{art.category?.[0]}</div>
                  }
                </div>
                <div className="admin-row-info">
                  <div className="admin-row-meta">
                    <span className="badge">{art.category}</span>
                    <span className="admin-date">{formatDisplay(art.date)}</span>
                  </div>
                  <p className="admin-row-title">{art.title}</p>
                  <p className="admin-row-author">by {art.author}</p>
                </div>
                <div className="admin-row-actions">
                  <button className="act-btn edit-btn" onClick={()=>setEditTarget(art)}>Edit</button>
                  <button className="act-btn del-btn"  onClick={()=>setDeleteTarget(art)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {(showForm || editTarget) && (
        <ArticleForm
          initial={editTarget}
          onSave={editTarget ? handleEdit : handleCreate}
          onCancel={()=>{ setShowForm(false); setEditTarget(null); }}
          saving={saving}
        />
      )}
      <DeleteModal article={deleteTarget} onConfirm={handleDelete} onCancel={()=>setDeleteTarget(null)} loading={deleting} />
    </main>
  );
}

/* ── Main App ── */
export default function App() {
  const [articles, setArticles]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [page, setPage]                   = useState("home");
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [menuOpen, setMenuOpen]           = useState(false);
  const [toast, setToast]                 = useState({ msg:"", type:"success" });

  const showToast = (msg, type="success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg:"", type:"success" }), 3000);
  };

  const loadArticles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getAll();
      setArticles(Array.isArray(data) ? data : []);
    } catch {
      showToast("Failed to load articles.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadArticles(); }, [loadArticles]);

  const handleNav = (link) => {
    setMenuOpen(false);
    setSelectedArticle(null);
    setPage(link);
    window.scrollTo({ top:0, behavior:"smooth" });
  };

  const openArticle = (art) => {
    setSelectedArticle(art);
    setPage("article");
    window.scrollTo({ top:0, behavior:"smooth" });
  };

  const goBack = () => {
    setSelectedArticle(null);
    setPage("news");
    window.scrollTo({ top:0, behavior:"smooth" });
  };

  const createArticle = async (data) => {
    const created = await api.create(data);
    if (created.error) { showToast(created.error, "error"); return; }
    setArticles(prev => [created, ...prev]);
    showToast("Article published successfully.");
  };

  const editArticle = async (id, data) => {
    const updated = await api.update(id, data);
    if (updated.error) { showToast(updated.error, "error"); return; }
    setArticles(prev => prev.map(a => a.id===id ? updated : a));
    if (selectedArticle?.id===id) setSelectedArticle(updated);
    showToast("Article updated.");
  };

  const deleteArticle = async (id) => {
    const res = await api.remove(id);
    if (res.error) { showToast(res.error, "error"); return; }
    setArticles(prev => prev.filter(a => a.id!==id));
    if (selectedArticle?.id===id) { setSelectedArticle(null); setPage("news"); }
    showToast("Article deleted.", "error");
  };

  const NAV = ["home","news","admin"];
  const NAV_LABELS = { home:"Home", news:"News", admin:"Admin" };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,600;1,8..60,300&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        :root{--ink:#1a1208;--paper:#f5f0e8;--cream:#ede8dc;--rule:#c8b89a;--muted:#7a6e5f;--accent:#c0392b;}
        body{background:var(--paper);color:var(--ink);font-family:'Source Serif 4',Georgia,serif;min-height:100vh;}

        .navbar{background:var(--ink);position:sticky;top:0;z-index:200;border-bottom:3px solid var(--accent);}
        .navbar-inner{max-width:1200px;margin:0 auto;padding:0 2rem;display:flex;align-items:center;justify-content:space-between;height:60px;}
        .brand{font-family:'Playfair Display',serif;font-size:1.5rem;font-weight:900;color:var(--paper);letter-spacing:0.04em;cursor:pointer;text-transform:uppercase;}
        .brand span{color:var(--accent);}
        .nav-links{display:flex;gap:2rem;list-style:none;}
        .nav-links li{cursor:pointer;color:#b0a89a;font-size:0.82rem;letter-spacing:0.12em;text-transform:uppercase;transition:color 0.2s;padding-bottom:2px;border-bottom:1px solid transparent;}
        .nav-links li:hover,.nav-links li.active{color:var(--paper);border-bottom-color:var(--accent);}
        .nav-links li.admin-link{color:#e8b44a;}
        .nav-links li.admin-link:hover,.nav-links li.admin-link.active{color:#f5c842;border-bottom-color:#f5c842;}
        .hamburger{display:none;flex-direction:column;gap:5px;cursor:pointer;background:none;border:none;padding:4px;}
        .hamburger span{display:block;width:22px;height:2px;background:var(--paper);}

        .home-hero{max-width:1200px;margin:0 auto;padding:5rem 2rem 3rem;text-align:center;border-bottom:1px solid var(--rule);}
        .home-hero .eyebrow{font-size:0.75rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--muted);margin-bottom:1.5rem;}
        .home-hero h1{font-family:'Playfair Display',serif;font-size:clamp(2.8rem,6vw,5rem);font-weight:900;line-height:1.08;max-width:760px;margin:0 auto 1.5rem;}
        .home-hero h1 em{font-style:italic;color:var(--accent);}
        .home-hero p{font-size:1.1rem;color:var(--muted);max-width:520px;margin:0 auto 2.5rem;line-height:1.7;font-weight:300;}
        .hero-cta{display:inline-block;background:var(--accent);color:#fff;font-size:0.8rem;letter-spacing:0.15em;text-transform:uppercase;padding:0.8rem 2.4rem;cursor:pointer;border:none;transition:background 0.2s,transform 0.15s;}
        .hero-cta:hover{background:#a93226;transform:translateY(-1px);}
        .home-features{max-width:1200px;margin:0 auto;padding:4rem 2rem;display:grid;grid-template-columns:repeat(3,1fr);gap:2rem;}
        .feature-card{border-top:2px solid var(--accent);padding-top:1.5rem;}
        .feature-card .num{font-family:'Playfair Display',serif;font-size:2.5rem;font-weight:900;color:var(--cream);margin-bottom:0.5rem;}
        .feature-card h3{font-family:'Playfair Display',serif;font-size:1.1rem;margin-bottom:0.6rem;}
        .feature-card p{font-size:0.9rem;color:var(--muted);line-height:1.6;font-weight:300;}

        .news-header{background:var(--ink);color:var(--paper);text-align:center;padding:4rem 2rem 3rem;}
        .section-label{font-size:0.7rem;letter-spacing:0.25em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem;}
        .news-header h2{font-family:'Playfair Display',serif;font-size:clamp(2rem,4vw,3.4rem);font-weight:900;}
        .news-header p{color:#8a7e70;font-size:0.95rem;margin-top:0.8rem;font-weight:300;}
        .articles-grid{max-width:1200px;margin:0 auto;padding:3rem 2rem 5rem;display:grid;grid-template-columns:repeat(2,1fr);gap:2px;}
        .empty-news{grid-column:1/-1;text-align:center;padding:5rem 2rem;color:var(--muted);font-style:italic;}
        .empty-news a{color:var(--accent);cursor:pointer;text-decoration:underline;}
        .article-card{background:#fff;cursor:pointer;overflow:hidden;display:flex;flex-direction:column;transition:box-shadow 0.25s;border:1px solid var(--cream);}
        .article-card:hover{box-shadow:0 8px 40px rgba(26,18,8,0.12);}
        .article-card:hover .card-img img{transform:scale(1.04);}
        .card-img{height:220px;overflow:hidden;position:relative;background:var(--cream);}
        .card-img img{width:100%;height:100%;object-fit:cover;transition:transform 0.5s ease;}
        .card-img-placeholder{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:3rem;color:var(--rule);}
        .card-category{position:absolute;top:1rem;left:1rem;background:var(--accent);color:#fff;font-size:0.65rem;letter-spacing:0.15em;text-transform:uppercase;padding:0.3rem 0.7rem;}
        .card-body{padding:1.8rem 1.8rem 2rem;flex:1;display:flex;flex-direction:column;}
        .card-meta{display:flex;align-items:center;gap:1rem;margin-bottom:0.9rem;}
        .card-date{font-size:0.72rem;letter-spacing:0.08em;color:var(--muted);text-transform:uppercase;}
        .card-author{font-size:0.72rem;color:var(--muted);font-style:italic;}
        .card-title{font-family:'Playfair Display',serif;font-size:1.35rem;font-weight:700;line-height:1.25;margin-bottom:0.8rem;transition:color 0.2s;}
        .article-card:hover .card-title{color:var(--accent);}
        .card-summary{font-size:0.9rem;color:var(--muted);line-height:1.65;font-weight:300;flex:1;}
        .card-read{margin-top:1.4rem;font-size:0.75rem;letter-spacing:0.1em;text-transform:uppercase;color:var(--accent);font-weight:600;display:inline-block;}
        .card-read::after{content:'→';margin-left:0.4rem;transition:transform 0.2s;display:inline-block;}
        .article-card:hover .card-read::after{transform:translateX(4px);}

        .article-page{max-width:780px;margin:0 auto;padding:3rem 2rem 6rem;}
        .back-btn{display:inline-flex;align-items:center;gap:0.5rem;font-size:0.75rem;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted);background:none;border:none;cursor:pointer;margin-bottom:2.5rem;transition:color 0.2s;padding:0;}
        .back-btn:hover{color:var(--accent);}
        .back-btn::before{content:'←';}
        .article-hero-img{width:100%;height:400px;object-fit:cover;margin-bottom:2.5rem;display:block;}
        .article-no-img{width:100%;height:200px;background:var(--cream);display:flex;align-items:center;justify-content:center;margin-bottom:2.5rem;font-family:'Playfair Display',serif;font-size:4rem;color:var(--rule);}
        .article-category-tag{display:inline-block;background:var(--accent);color:#fff;font-size:0.65rem;letter-spacing:0.18em;text-transform:uppercase;padding:0.3rem 0.8rem;margin-bottom:1.2rem;}
        .article-title{font-family:'Playfair Display',serif;font-size:clamp(1.9rem,4vw,2.9rem);font-weight:900;line-height:1.12;margin-bottom:1.2rem;}
        .article-byline{display:flex;align-items:center;gap:1.5rem;padding-bottom:1.5rem;border-bottom:1px solid var(--rule);margin-bottom:2rem;}
        .article-byline .author{font-size:0.9rem;font-style:italic;}
        .article-byline .date{font-size:0.8rem;color:var(--muted);letter-spacing:0.06em;}
        .article-body p{font-size:1.08rem;line-height:1.85;color:#2a2118;margin-bottom:1.8rem;font-weight:300;}
        .article-body p:first-child::first-letter{font-family:'Playfair Display',serif;font-size:4rem;font-weight:900;float:left;line-height:0.75;margin:0.1rem 0.12rem 0 0;color:var(--accent);}
        .article-divider{border:none;border-top:1px solid var(--rule);margin:3rem 0;}

        .admin-header{background:var(--ink);padding:3.5rem 2rem 2.5rem;border-bottom:3px solid #f5c842;}
        .admin-header-inner{max-width:1200px;margin:0 auto;display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:1.5rem;}
        .admin-title{font-family:'Playfair Display',serif;font-size:clamp(1.8rem,4vw,3rem);font-weight:900;color:var(--paper);line-height:1.1;}
        .admin-sub{color:#8a7e70;font-size:0.9rem;margin-top:0.3rem;}
        .admin-body{max-width:1200px;margin:0 auto;padding:2.5rem 2rem 5rem;}
        .admin-toolbar{display:flex;align-items:center;gap:1rem;margin-bottom:2rem;}
        .search-input{flex:1;background:#fff;border:1px solid var(--rule);padding:0.7rem 1rem;font-family:'Source Serif 4',serif;font-size:0.9rem;color:var(--ink);outline:none;transition:border-color 0.2s;}
        .search-input:focus{border-color:var(--ink);}
        .search-count{font-size:0.8rem;color:var(--muted);white-space:nowrap;}
        .admin-list{display:flex;flex-direction:column;gap:2px;}
        .admin-row{background:#fff;display:flex;align-items:center;gap:1.2rem;padding:1rem 1.2rem;border:1px solid var(--cream);transition:box-shadow 0.2s;}
        .admin-row:hover{box-shadow:0 2px 16px rgba(26,18,8,0.08);}
        .admin-row-img{width:72px;height:56px;flex-shrink:0;overflow:hidden;}
        .admin-row-img img{width:100%;height:100%;object-fit:cover;}
        .img-placeholder{width:100%;height:100%;background:var(--cream);display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:1.4rem;color:var(--rule);}
        .admin-row-info{flex:1;min-width:0;}
        .admin-row-meta{display:flex;align-items:center;gap:0.7rem;margin-bottom:0.3rem;}
        .badge{background:var(--accent);color:#fff;font-size:0.6rem;letter-spacing:0.12em;text-transform:uppercase;padding:0.18rem 0.55rem;flex-shrink:0;}
        .admin-date{font-size:0.72rem;color:var(--muted);}
        .admin-row-title{font-family:'Playfair Display',serif;font-size:1rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .admin-row-author{font-size:0.78rem;color:var(--muted);font-style:italic;margin-top:0.1rem;}
        .admin-row-actions{display:flex;gap:0.5rem;flex-shrink:0;}
        .act-btn{font-family:'Source Serif 4',serif;font-size:0.75rem;letter-spacing:0.06em;text-transform:uppercase;padding:0.4rem 0.9rem;border:none;cursor:pointer;transition:background 0.2s,color 0.2s;}
        .edit-btn{background:var(--ink);color:var(--paper);}
        .edit-btn:hover{background:#333;}
        .del-btn{background:transparent;color:var(--accent);border:1px solid var(--accent);}
        .del-btn:hover{background:var(--accent);color:#fff;}
        .empty-state{text-align:center;padding:5rem 2rem;color:var(--muted);font-style:italic;}

        .btn-primary{background:var(--accent);color:#fff;font-family:'Source Serif 4',serif;font-size:0.8rem;letter-spacing:0.12em;text-transform:uppercase;padding:0.8rem 2rem;border:none;cursor:pointer;transition:background 0.2s;}
        .btn-primary:hover:not(:disabled){background:#a93226;}
        .btn-primary:disabled{opacity:0.6;cursor:not-allowed;}
        .btn-danger{background:#c0392b;color:#fff;font-family:'Source Serif 4',serif;font-size:0.8rem;letter-spacing:0.1em;text-transform:uppercase;padding:0.7rem 1.6rem;border:none;cursor:pointer;}
        .btn-danger:hover:not(:disabled){background:#a93226;}
        .btn-danger:disabled{opacity:0.6;cursor:not-allowed;}
        .btn-ghost{background:transparent;color:var(--muted);font-family:'Source Serif 4',serif;font-size:0.8rem;letter-spacing:0.1em;text-transform:uppercase;padding:0.7rem 1.6rem;border:1px solid var(--rule);cursor:pointer;}
        .btn-ghost:hover:not(:disabled){border-color:var(--ink);color:var(--ink);}
        .btn-ghost:disabled{opacity:0.6;cursor:not-allowed;}

        .form-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:500;display:flex;justify-content:flex-end;overflow-y:auto;}
        .form-panel{background:var(--paper);width:100%;max-width:640px;min-height:100vh;display:flex;flex-direction:column;animation:slideInRight 0.3s ease;}
        .form-header{background:var(--ink);padding:1.5rem 2rem;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;border-bottom:3px solid var(--accent);}
        .form-header h2{font-family:'Playfair Display',serif;font-size:1.3rem;color:var(--paper);font-weight:700;}
        .icon-btn{background:none;border:none;color:#8a7e70;font-size:1.2rem;cursor:pointer;padding:0.2rem;line-height:1;}
        .icon-btn:hover{color:var(--paper);}
        .form-body{flex:1;padding:2rem;overflow-y:auto;display:flex;flex-direction:column;gap:1.4rem;}
        .form-row{display:flex;gap:1rem;}
        .form-row.two-col>*{flex:1;}
        .field{display:flex;flex-direction:column;gap:0.4rem;}
        .field label{font-size:0.72rem;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted);font-weight:400;}
        .field input,.field textarea,.field select{background:#fff;border:1px solid var(--rule);padding:0.65rem 0.9rem;font-family:'Source Serif 4',serif;font-size:0.95rem;color:var(--ink);outline:none;transition:border-color 0.2s;resize:vertical;width:100%;}
        .field input:focus,.field textarea:focus,.field select:focus{border-color:var(--ink);}
        .err{font-size:0.75rem;color:var(--accent);}
        .inline-add-btn{background:none;border:none;color:var(--accent);font-family:'Source Serif 4',serif;font-size:0.75rem;cursor:pointer;text-decoration:underline;padding:0;}
        .para-row{display:flex;gap:0.6rem;align-items:flex-start;margin-top:0.5rem;}
        .para-num{font-family:'Playfair Display',serif;font-size:1.2rem;color:var(--rule);padding-top:0.4rem;min-width:1.2rem;}
        .para-row textarea{flex:1;}
        .remove-para-btn{background:none;border:none;color:var(--rule);font-size:0.85rem;cursor:pointer;padding:0.6rem 0;flex-shrink:0;transition:color 0.2s;}
        .remove-para-btn:hover{color:var(--accent);}
        .form-footer{padding:1.5rem 2rem;border-top:1px solid var(--rule);display:flex;gap:1rem;flex-shrink:0;background:var(--cream);}

        footer{background:var(--ink);color:#6a5f50;text-align:center;padding:2rem;font-size:0.78rem;letter-spacing:0.06em;}
        footer span{color:var(--accent);}

        @keyframes fadeUp{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
        @keyframes slideInRight{from{transform:translateX(40px);opacity:0;}to{transform:translateX(0);opacity:1;}}
        @keyframes slideIn{from{transform:translateY(12px);opacity:0;}to{transform:translateY(0);opacity:1;}}
        @keyframes spin{to{transform:rotate(360deg);}}
        .fade-up{animation:fadeUp 0.5s ease both;}
        .fade-up-1{animation-delay:0.05s;}.fade-up-2{animation-delay:0.12s;}.fade-up-3{animation-delay:0.2s;}.fade-up-4{animation-delay:0.28s;}.fade-up-5{animation-delay:0.36s;}

        @media(max-width:768px){
          .nav-links{display:none;}
          .nav-links.open{display:flex;flex-direction:column;position:absolute;top:60px;left:0;right:0;background:var(--ink);padding:1rem 2rem 2rem;gap:1.2rem;border-top:1px solid #333;}
          .hamburger{display:flex;}
          .navbar{position:relative;}
          .home-features{grid-template-columns:1fr;}
          .articles-grid{grid-template-columns:1fr;}
          .form-row.two-col{flex-direction:column;}
          .article-hero-img{height:220px;}
          .admin-row-title{white-space:normal;}
        }
      `}</style>

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="brand" onClick={()=>handleNav("home")}>The<span>Ink</span>Press</div>
          <button className="hamburger" onClick={()=>setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <span/><span/><span/>
          </button>
          <ul className={`nav-links${menuOpen?" open":""}`}>
            {NAV.map(link => (
              <li key={link}
                className={`${page===link||(page==="article"&&link==="news")?"active":""} ${link==="admin"?"admin-link":""}`}
                onClick={()=>handleNav(link)}
              >
                {NAV_LABELS[link]}
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* HOME */}
      {page==="home" && (
        <main>
          <section className="home-hero fade-up">
            <p className="eyebrow">Est. 2025 · Independent Journalism</p>
            <h1>Stories that <em>matter,</em> told without compromise.</h1>
            <p>Depth over speed. Context over clicks. TheInkPress brings you rigorous reporting on science, environment, culture, and technology.</p>
            <button className="hero-cta" onClick={()=>handleNav("news")}>Read Latest News</button>
          </section>
          <section className="home-features">
            {[
              {num:`0${articles.length}`,title:"Articles Published",desc:"Deeply reported pieces spanning multiple disciplines — updated live from the editorial desk."},
              {num:"3+",title:"Paragraphs of Depth",desc:"Every article offers full-length, contextual writing. No listicles, no hot takes — just considered journalism."},
              {num:"∞",title:"Independent Voice",desc:"Editorially independent and free from algorithmic pressure. We follow stories wherever they lead."},
            ].map((f,i)=>(
              <div className={`feature-card fade-up fade-up-${i+2}`} key={i}>
                <div className="num">{f.num}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </section>
        </main>
      )}

      {/* NEWS */}
      {page==="news" && (
        <main>
          <div className="news-header fade-up">
            <p className="section-label">Latest Coverage</p>
            <h2>News & Features</h2>
            <p>{articles.length} article{articles.length!==1?"s":""} published</p>
          </div>
          {loading ? <Spinner /> : (
            <div className="articles-grid">
              {articles.length===0 ? (
                <div className="empty-news">
                  <p>No articles yet. <a onClick={()=>handleNav("admin")}>Go to the Editorial Desk</a> to publish one.</p>
                </div>
              ) : articles.map((art,i)=>(
                <article className={`article-card fade-up fade-up-${Math.min(i+1,5)}`} key={art.id} onClick={()=>openArticle(art)}>
                  <div className="card-img">
                    {art.image
                      ? <img src={art.image} alt={art.title} onError={e=>e.target.style.display="none"} />
                      : <div className="card-img-placeholder">{art.category?.[0]}</div>
                    }
                    <span className="card-category">{art.category}</span>
                  </div>
                  <div className="card-body">
                    <div className="card-meta">
                      <span className="card-date">{formatDisplay(art.date)}</span>
                      <span className="card-author">by {art.author}</span>
                    </div>
                    <h3 className="card-title">{art.title}</h3>
                    <p className="card-summary">{art.summary}</p>
                    <div className="card-read">Read Article</div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      )}

      {/* ARTICLE */}
      {page==="article" && selectedArticle && (
        <main>
          <div className="article-page">
            <button className="back-btn" onClick={goBack}>Back to News</button>
            {selectedArticle.image
              ? <img className="article-hero-img fade-up" src={selectedArticle.image} alt={selectedArticle.title} />
              : <div className="article-no-img fade-up">{selectedArticle.category?.[0]}</div>
            }
            <span className="article-category-tag fade-up fade-up-1">{selectedArticle.category}</span>
            <h1 className="article-title fade-up fade-up-2">{selectedArticle.title}</h1>
            <div className="article-byline fade-up fade-up-3">
              <span className="author">By {selectedArticle.author}</span>
              <span className="date">{formatDisplay(selectedArticle.date)}</span>
            </div>
            <div className="article-body fade-up fade-up-4">
              {(selectedArticle.paragraphs || []).map((para,i)=><p key={i}>{para}</p>)}
            </div>
            <hr className="article-divider"/>
            <button className="back-btn" onClick={goBack}>Back to News</button>
          </div>
        </main>
      )}

      {/* ADMIN */}
      {page==="admin" && (
        <AdminPage
          articles={articles}
          onCreate={createArticle}
          onEdit={editArticle}
          onDelete={deleteArticle}
        />
      )}

      <footer>© 2025 <span>TheInkPress</span> · Independent Journalism · All rights reserved</footer>
      <Toast msg={toast.msg} type={toast.type} />
    </>
  );
}
