import{j as e,m as i}from"./vendor-react-dE8-2NoN.js";import{r,f as n,b as X,l as $,p as w,W as F,n as S,ah as T,T as E,m as C,a6 as H,X as R,a8 as B,N as U}from"./vendor-ui-Bq2TQ6SB.js";import{u as V}from"./index-CEuaEbzT.js";import"./vendor-charts-B_b_m-Bk.js";import"./vendor-firebase-25KR_2Xm.js";function K(){const{journalEntries:t,addJournalEntry:D,updateJournalEntry:I,addNotification:b}=V(),[o,N]=r.useState(n(new Date,"yyyy-MM-dd")),[u,k]=r.useState(!1),s=t.find(a=>a.date===o),d=o===n(new Date,"yyyy-MM-dd"),[c,y]=r.useState(""),[m,j]=r.useState(""),[p,f]=r.useState(""),[g,v]=r.useState(""),[W,l]=r.useState(!1),[x,z]=r.useState(!1);X.useEffect(()=>{s?(y(s.wins||""),j(s.learn||""),f(s.mistakes||""),v(s.tomorrowIntent||""),l(!1)):(y(""),j(""),f(""),v(""),l(d))},[s,o,d]);const L=r.useMemo(()=>t.reduce((a,h)=>a+(h.xpGain||0)+(h.streakBonus||0),0),[t]),M=r.useMemo(()=>{const a=t.filter(P=>P.date.startsWith(n(new Date,"yyyy-MM"))).length,h=new Date().getDate();return Math.round(a/(h||1)*100)},[t]),J=async()=>{z(!0);try{const a={wins:c,learn:m,mistakes:p,tomorrowIntent:g,date:o};s?(await I(s.id,a),b({title:"Journal Updated",message:`Historical record for ${n(w(o),"MMM dd")} saved.`,type:"info",icon:"💾"})):(await D(a),b({title:"Mission Logged",message:"Daily reflection secured. +25 XP earned.",type:"xp",icon:"🎯"})),k(!0),setTimeout(()=>k(!1),2e3),l(!1)}catch{b({title:"Save Error",message:"Failed to save your journal entry.",type:"info",icon:"❌"})}finally{z(!1)}};return e.jsxs("div",{className:"page-content",children:[e.jsxs("div",{className:"journal-grid",children:[e.jsx("div",{className:"journal-main",children:e.jsx(i.div,{className:"glass-card journal-card",initial:{opacity:0,y:20},animate:{opacity:1,y:0},children:W?e.jsxs("div",{className:"journal-form",children:[e.jsxs("div",{className:"journal-sections-edit",children:[e.jsxs("section",{className:"form-section",children:[e.jsxs("label",{children:[e.jsx(S,{size:16})," What were your wins today?"]}),e.jsx("textarea",{placeholder:"No matter how small, list your victories...",value:c,onChange:a=>y(a.target.value)})]}),e.jsxs("section",{className:"form-section",children:[e.jsxs("label",{children:[e.jsx(T,{size:16})," What did you learn?"]}),e.jsx("textarea",{placeholder:"Techniques, mindset shifts, new knowledge...",value:m,onChange:a=>j(a.target.value)})]}),e.jsxs("section",{className:"form-section",children:[e.jsxs("label",{children:[e.jsx(E,{size:16})," Mistakes / Missed Tasks"]}),e.jsx("textarea",{placeholder:"What went wrong? Why? (Be honest, no judgment)",value:p,onChange:a=>f(a.target.value)})]}),e.jsxs("section",{className:"form-section",children:[e.jsxs("label",{children:[e.jsx(C,{size:16})," Tomorrow's Intent"]}),e.jsx("textarea",{placeholder:"What is the #1 thing that must happen tomorrow?",value:g,onChange:a=>v(a.target.value)})]})]}),e.jsxs("div",{className:"form-actions",children:[e.jsxs(i.button,{className:`premium-save-btn ${u?"success":""} ${x?"saving":""}`,onClick:J,disabled:x||!c.trim()&&!m.trim()&&!p.trim()&&!g.trim()||u,whileHover:{scale:1.02,translateY:-2},whileTap:{scale:.98},children:[e.jsx("div",{className:"btn-content",children:x?e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"btn-spinner"}),e.jsx("span",{children:"Securing Log..."})]}):u?e.jsxs(e.Fragment,{children:[e.jsx(i.div,{initial:{scale:0},animate:{scale:1},className:"success-icon",children:"✅"}),e.jsx("span",{children:"Entry Locked!"})]}):e.jsxs(e.Fragment,{children:[e.jsx("span",{children:s?"Update Journal":"Lock in Entry (+25 XP)"}),e.jsx(H,{size:18,className:"btn-icon"})]})}),e.jsx("div",{className:"btn-glow"})]}),d&&s&&!x&&e.jsxs(i.button,{className:"btn-secondary",onClick:()=>l(!1),whileHover:{scale:1.02,backgroundColor:"rgba(255,255,255,0.08)"},whileTap:{scale:.98},children:[e.jsx(R,{size:16}),"Cancel"]})]})]}):e.jsxs("div",{className:"journal-readonly",children:[e.jsxs("div",{className:"journal-header-actions",children:[e.jsxs("div",{className:"journal-date-badge",children:[e.jsx($,{size:18}),e.jsx("span",{children:n(w(o),"MMMM dd, yyyy")})]}),e.jsxs("div",{style:{display:"flex",gap:12},children:[!d&&e.jsx(i.button,{className:"btn-secondary btn-sm",onClick:()=>N(n(new Date,"yyyy-MM-dd")),whileHover:{scale:1.05},whileTap:{scale:.95},children:"Back to Today"}),e.jsxs(i.button,{className:"btn-secondary btn-sm",onClick:()=>l(!0),whileHover:{scale:1.05},whileTap:{scale:.95},children:[e.jsx(F,{size:14})," Edit Entry"]})]})]}),e.jsxs("div",{className:"journal-sections-readonly",children:[e.jsxs("div",{className:"journal-section-item",children:[e.jsxs("div",{className:"section-header",children:[e.jsx(S,{size:20}),e.jsx("span",{children:"Wins Today"})]}),e.jsx("div",{className:"section-content",children:c||e.jsx("span",{className:"empty-val",children:"No wins recorded."})})]}),e.jsxs("div",{className:"journal-section-item",children:[e.jsxs("div",{className:"section-header",children:[e.jsx(T,{size:20}),e.jsx("span",{children:"Learnings"})]}),e.jsx("div",{className:"section-content",children:m||e.jsx("span",{className:"empty-val",children:"No learnings recorded."})})]}),e.jsxs("div",{className:"journal-section-item",children:[e.jsxs("div",{className:"section-header",children:[e.jsx(E,{size:20}),e.jsx("span",{children:"Mistakes & Challenges"})]}),e.jsx("div",{className:"section-content",children:p||e.jsx("span",{className:"empty-val",children:"No mistakes recorded."})})]}),e.jsxs("div",{className:"journal-section-item",children:[e.jsxs("div",{className:"section-header",children:[e.jsx(C,{size:20}),e.jsx("span",{children:"Tomorrow's Intent"})]}),e.jsx("div",{className:"section-content",children:g||e.jsx("span",{className:"empty-val",children:"No intent recorded for tomorrow."})})]})]})]})})}),e.jsxs("aside",{className:"journal-sidebar",children:[e.jsxs(i.div,{className:"journal-xp-badge",initial:{opacity:0,scale:.9},animate:{opacity:1,scale:1},transition:{delay:.05},children:[e.jsx(B,{size:20,fill:"currentColor",className:"xp-star"}),e.jsxs("span",{children:["Total Journal XP: ",L]})]}),e.jsxs(i.div,{className:"glass-card analytics-card",initial:{opacity:0,x:20},animate:{opacity:1,x:0},transition:{delay:.1},children:[e.jsx("h3",{children:"Journal Insights"}),e.jsxs("div",{className:"insight-stat",children:[e.jsx("div",{className:"stat-label",children:"Consistency"}),e.jsxs("div",{className:"stat-value",children:[M,"%"]}),e.jsx("div",{className:"stat-progress",children:e.jsx("div",{className:"stat-progress-fill",style:{width:`${M}%`}})})]}),e.jsxs("div",{className:"insight-stat",children:[e.jsx("div",{className:"stat-label",children:"Total Entries"}),e.jsx("div",{className:"stat-value",children:t.length})]}),e.jsxs("div",{className:"insight-stat",children:[e.jsx("div",{className:"stat-label",children:"This Month"}),e.jsx("div",{className:"stat-value",children:t.filter(a=>a.date.startsWith(n(new Date,"yyyy-MM"))).length})]})]}),e.jsxs(i.div,{className:"glass-card history-list-card",initial:{opacity:0,x:20},animate:{opacity:1,x:0},transition:{delay:.2},children:[e.jsx("h3",{children:"Past Logs"}),e.jsxs("div",{className:"recent-entries-list",children:[t.map(a=>e.jsx("div",{className:"recent-entry-wrapper",children:e.jsxs("button",{className:`recent-entry-item ${o===a.date?"active":""}`,onClick:()=>N(a.date),children:[e.jsx("div",{className:"entry-dot",style:{background:"var(--primary)"}}),e.jsxs("div",{className:"entry-info",children:[e.jsx("span",{className:"entry-date",children:n(w(a.date),"MMM dd")}),e.jsx("span",{className:"entry-preview",children:a.wins?`🏆 ${a.wins.substring(0,30)}...`:a.tomorrowIntent?`🎯 ${a.tomorrowIntent.substring(0,30)}...`:"Empty log"})]}),e.jsx(U,{size:14,className:"chevron"})]})},a.id)),t.length===0&&e.jsx("p",{className:"empty-text",children:"No past logs yet."})]})]})]})]}),e.jsx("style",{children:`
                .journal-grid {
                    display: grid;
                    grid-template-columns: 1fr 340px;
                    gap: 2rem;
                    max-width: 1300px;
                    width: 100%;
                }

                @media (max-width: 1200px) {
                    .journal-grid {
                        grid-template-columns: 1fr 300px;
                        gap: 1.5rem;
                    }
                }

                @media (max-width: 1024px) {
                    .journal-grid {
                        grid-template-columns: 1fr;
                    }
                    .journal-sidebar {
                        order: 2;
                    }
                }

                .page-content {
                    width: 100%;
                    max-width: 1300px;
                    margin: 0 auto;
                }

                @media (max-width: 640px) {
                    .page-content {
                        padding: 1rem;
                    }
                    .journal-card {
                        padding: 1.5rem;
                    }
                    .premium-save-btn {
                        width: 100%;
                    }
                }

                .journal-card {
                    padding: 2.5rem;
                }

                .form-actions {
                    margin-top: 2.5rem;
                    display: flex;
                    gap: 1rem;
                    padding-bottom: 2rem;
                }

                .premium-save-btn {
                    position: relative;
                    padding: 1rem 2rem;
                    background: var(--gradient-primary);
                    border: none;
                    border-radius: 16px;
                    color: white;
                    font-weight: 800;
                    font-size: 1rem;
                    cursor: pointer;
                    overflow: hidden;
                    transition: all 0.3s ease;
                    box-shadow: 0 10px 20px rgba(var(--primary-rgb), 0.3),
                                0 0 0 1px rgba(255,255,255,0.1) inset;
                    min-width: 240px;
                }

                .premium-save-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    filter: grayscale(0.5);
                }

                .premium-save-btn.success {
                    background: linear-gradient(135deg, #00b09b, #96c93d);
                    box-shadow: 0 10px 20px rgba(0, 176, 155, 0.3);
                }

                .btn-content {
                    position: relative;
                    z-index: 2;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                }

                .btn-icon {
                    transition: transform 0.3s ease;
                }

                .premium-save-btn:hover:not(:disabled) .btn-icon {
                    transform: translateX(3px) rotate(-5deg);
                }

                .btn-glow {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, transparent 70%);
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                .premium-save-btn:hover:not(:disabled) .btn-glow {
                    opacity: 1;
                }

                .btn-spinner {
                    width: 18px;
                    height: 18px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .success-icon {
                    font-size: 1.2rem;
                }

                .journal-form {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }

                .form-section {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .form-section label {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-weight: 600;
                    color: rgba(255,255,255,0.9);
                    font-size: 0.95rem;
                }

                .journal-xp-badge {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 1rem 1.75rem;
                    background: rgba(255, 215, 0, 0.08);
                    border: 1px solid rgba(255, 215, 0, 0.3);
                    border-radius: 16px;
                    color: gold;
                    font-weight: 800;
                    font-size: 1.15rem;
                    margin-bottom: 2rem;
                    box-shadow: 0 0 20px rgba(255, 215, 0, 0.05),
                                0 0 0 1px rgba(255, 215, 0, 0.15) inset;
                }

                .xp-star {
                    filter: drop-shadow(0 0 8px gold);
                }

                .journal-sections-readonly, .journal-sections-edit {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }

                .empty-val {
                    opacity: 0.4;
                    font-style: italic;
                }

                .form-section textarea {
                    background: rgba(0,0,0,0.2);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 12px;
                    padding: 1rem;
                    color: white;
                    min-height: 120px;
                    resize: vertical;
                    transition: border-color 0.2s;
                    font-family: inherit;
                }

                .journal-readonly {
                    display: flex;
                    flex-direction: column;
                    gap: 2.5rem;
                }

                .journal-header-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    padding-bottom: 1.5rem;
                }

                .journal-date-badge {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.5rem 1rem;
                    background: rgba(var(--primary-rgb), 0.1);
                    border: 1px solid rgba(var(--primary-rgb), 0.2);
                    border-radius: 20px;
                    color: var(--primary);
                    font-weight: 500;
                }

                .journal-section-item {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .section-header {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    font-weight: 600;
                    font-size: 1.1rem;
                    color: var(--primary);
                }

                .section-content {
                    color: rgba(255,255,255,0.7);
                    line-height: 1.6;
                    padding: 1rem;
                    background: rgba(255,255,255,0.02);
                    border-radius: 12px;
                    white-space: pre-wrap;
                }

                .analytics-card {
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .insight-stat {
                    background: rgba(255,255,255,0.03);
                    padding: 1rem;
                    border-radius: 12px;
                }

                .stat-label { font-size: 0.8rem; color: rgba(255,255,255,0.5); margin-bottom: 0.25rem; }
                .stat-value { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.75rem; }
                .stat-progress { height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden; }
                .stat-progress-fill { height: 100%; background: var(--primary); transition: width 0.5s ease-out; }

                .history-list-card {
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .recent-entries-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    max-height: 400px;
                    overflow-y: auto;
                    padding-right: 0.5rem;
                }

                .recent-entry-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.75rem;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 12px;
                    color: white;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-align: left;
                    width: 100%;
                }

                .recent-entry-item:hover {
                    background: rgba(255,255,255,0.08);
                    transform: translateX(4px);
                }

                .recent-entry-item.active {
                    background: rgba(var(--primary-rgb), 0.1);
                    border-color: var(--primary);
                }

                .entry-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    flex-shrink: 0;
                }

                .entry-info {
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                    min-width: 0;
                }

                .entry-date {
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: var(--primary);
                }

                .entry-preview {
                    font-size: 0.75rem;
                    color: rgba(255,255,255,0.5);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .empty-text {
                    font-size: 0.8rem;
                    color: rgba(255,255,255,0.3);
                    text-align: center;
                    padding: 1rem;
                }

                .recent-entries-list::-webkit-scrollbar { width: 4px; }
                .recent-entries-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

                .recent-entry-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .btn-secondary {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 12px;
                    color: rgba(255, 255, 255, 0.6);
                    padding: 0.75rem 1.5rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .btn-secondary:hover {
                    background: rgba(255, 255, 255, 0.08);
                    color: white;
                    border-color: rgba(255, 255, 255, 0.15);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }

                .btn-sm {
                    padding: 0.5rem 1rem;
                    font-size: 0.8rem;
                    border-radius: 10px;
                }

                .form-section textarea:focus {
                    border-color: var(--primary);
                    outline: none;
                    background: rgba(0,0,0,0.3);
                    box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
                }

                .form-section label {
                  margin-bottom: 0.5rem;
                  font-size: 1.1rem !important;
                  font-weight: 700 !important;
                }

                .section-header {
                  font-size: 1.1rem;
                  font-weight: 700;
                  color: var(--primary);
                  margin-bottom: 0.5rem;
                }
                
                .section-content {
                  padding: 1.25rem !important;
                  background: rgba(255,255,255,0.03) !important;
                  border: 1px solid rgba(255,255,255,0.05);
                  border-radius: 16px !important;
                }

            `})]})}export{K as default};
