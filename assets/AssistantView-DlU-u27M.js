import{j as e,A as C,m as o}from"./vendor-react-dE8-2NoN.js";import{r as n,X as U,P as S,H as $,a9 as G,f as g,Y as B,M as F,o as A,aa as E,D as V,u as b,ab as X,a0 as Y,ac as K,ad as W,N as q,U as J,I as Q,T as Z,G as _,ae as ee,af as ae}from"./vendor-ui-Bq2TQ6SB.js";import{u as re}from"./index-C0_HeUlG.js";import"./vendor-charts-B_b_m-Bk.js";import"./vendor-firebase-25KR_2Xm.js";function le(){const{user:M,addTask:I,getStreak:R,pendingAssistantMessage:x,setPendingAssistantMessage:T,getTodaysTasks:L,conversations:h,activeConversationMessages:l,activeConversationId:u,fetchConversations:O,setActiveConversation:f,sendAssistantMessage:D,clearConversation:P}=re(),y=L(),[d,v]=n.useState(""),[c,w]=n.useState(!1),[j,k]=n.useState(null),[N,p]=n.useState(!1),z=n.useRef(null);n.useEffect(()=>{O()},[]),n.useEffect(()=>{x&&!c&&(m(x),T(void 0))},[x]),n.useEffect(()=>{z.current?.scrollIntoView({behavior:"smooth"})},[l]);const m=async a=>{const r=typeof a=="string"?a:d;if(!(!r.trim()||!M)){v(""),w(!0),k(null);try{const t={pendingTasks:y.filter(i=>!i.isCompleted).map(i=>({title:i.title,priority:i.priority,horizon:i.horizon,isRolledOver:i.isRolledOver})),yesterdayCompletedCount:0,streak:R()};await D(r,t)}catch(s){k(s.message||"An error occurred")}finally{w(!1)}}},H=a=>{I({title:a.title,description:"AI Suggested Task",priority:a.priority?.toLowerCase()||"medium",horizon:"daily",category:"Work",dueDate:g(new Date,"yyyy-MM-dd"),energyLevel:"medium",estimatedMinutes:parseInt(a.estimatedTime)||30,subtasks:[],tags:["AI Suggested"],recurrence:"none",type:"daily"})};return e.jsxs("div",{className:"assistant-layout",children:[e.jsx(C,{children:N&&e.jsx(o.div,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},onClick:()=>p(!1),className:"sidebar-overlay"})}),e.jsxs("div",{className:`assistant-sidebar ${N?"mobile-open":""}`,children:[e.jsxs("div",{className:"sidebar-mobile-header",children:[e.jsx("span",{children:"MISSION LOGS"}),e.jsx("button",{onClick:()=>p(!1),children:e.jsx(U,{size:20})})]}),e.jsx("div",{className:"sidebar-header",children:e.jsxs("button",{className:"new-chat-btn",onClick:()=>f(null),children:[e.jsx(S,{size:18}),"New Mission"]})}),e.jsxs("div",{className:"conversation-list",children:[e.jsxs("div",{className:"list-label",children:[e.jsx($,{size:14}),"Recent Missions"]}),h.map(a=>e.jsxs("div",{className:`conv-item ${u===a.id?"active":""}`,onClick:()=>{f(a.id),p(!1)},children:[e.jsx(G,{size:16}),e.jsxs("div",{className:"conv-content",children:[e.jsx("span",{className:"conv-title",children:a.title||"Mission Log"}),e.jsx("span",{className:"conv-date",children:a.lastMessageAt?g(new Date(a.lastMessageAt),"MMM dd, HH:mm"):"Recently"})]}),e.jsx("button",{className:"conv-delete",onClick:r=>{r.stopPropagation(),window.confirm("Erase this mission data?")&&P(a.id)},children:e.jsx(B,{size:14})})]},a.id)),h.length===0&&e.jsx("div",{className:"empty-history",children:"No mission history yet."})]})]}),e.jsxs("div",{className:"chat-main",children:[e.jsxs("div",{className:"chat-header",children:[e.jsx("button",{className:"mobile-menu-toggle",onClick:()=>p(!0),children:e.jsx(F,{size:20})}),e.jsxs("div",{className:"header-info",children:[e.jsx("div",{className:"icon-pulse desktop-only",children:e.jsx(A,{size:28,color:"var(--primary)"})}),e.jsxs("div",{className:"header-text",children:[e.jsxs("div",{className:"header-top",children:[e.jsx("h2",{children:"ARIES COMMAND"}),e.jsxs("div",{className:"status-badge pulse",children:[e.jsx(E,{size:10}),e.jsx("span",{children:"PLATFORM: SECURE • NEURAL SYNC ACTIVE"})]}),e.jsx("div",{className:"edge-badge",children:"EDGE"})]}),e.jsx("p",{children:u?"Secure communication line active...":"System initialized. Waiting for strategic input."})]})]}),e.jsx("div",{className:"header-actions",children:l.length>0&&e.jsx("button",{onClick:()=>{const a=l.map(i=>`${i.role==="user"?"You":"Coach"}: ${i.content}`).join(`

`),r=new Blob([a],{type:"text/plain"}),s=URL.createObjectURL(r),t=document.createElement("a");t.href=s,t.download=`mission-data-${g(new Date,"yyyy-MM-dd")}.txt`,t.click()},className:"action-btn",title:"Export Data",children:e.jsx(V,{size:18})})})]}),e.jsxs("div",{className:"chat-container",children:[e.jsx("div",{className:"neural-grid"}),e.jsxs(C,{mode:"popLayout",children:[l.length===0&&!c&&e.jsx(o.div,{initial:{opacity:0,scale:.95},animate:{opacity:1,scale:1},className:"welcome-state",children:e.jsxs("div",{className:"welcome-card shadow-premium",children:[e.jsxs("div",{className:"welcome-icon-wrapper",children:[e.jsx(o.div,{className:"icon-ring",animate:{rotate:360},transition:{duration:15,repeat:1/0,ease:"linear"}}),e.jsx(o.div,{className:"icon-ring-outer",animate:{rotate:-360},transition:{duration:25,repeat:1/0,ease:"linear"}}),e.jsx(b,{size:48,className:"welcome-primary-icon"})]}),e.jsx("h3",{children:"Commander, awaiting briefing."}),e.jsx("p",{children:"I am ARIES v3.1—your strategic intelligence engine. I optimize pathfinding for your objectives and coordinate your daily operations."}),e.jsxs("div",{className:"system-stats",children:[e.jsxs("div",{className:"stat-pill",children:[e.jsx(X,{size:12})," Neural Core"]}),e.jsxs("div",{className:"stat-pill",children:[e.jsx(Y,{size:12})," Encrypted"]}),e.jsxs("div",{className:"stat-pill",children:[e.jsx(K,{size:12})," Sync: Online"]})]}),e.jsx("div",{className:"suggestion-grid",children:[{text:"Analyze my targets for today.",label:"Mission Analysis",icon:e.jsx(E,{size:16}),desc:"Tactical overview"},{text:"I need a strategic breakdown of my largest objective.",label:"Objective Decimation",icon:e.jsx(W,{size:16}),desc:"Split big goals"},{text:"Optimize my morning routine for maximum focus.",label:"Workflow Logic",icon:e.jsx(A,{size:16}),desc:"Focus optimization"}].map((a,r)=>e.jsxs(o.button,{whileHover:{x:8,backgroundColor:"rgba(var(--primary-rgb), 0.1)"},onClick:()=>m(a.text),className:"suggestion-btn",children:[e.jsxs("div",{className:"btn-left",children:[e.jsx("div",{className:"btn-icon-box",children:a.icon}),e.jsxs("div",{className:"btn-text-content",children:[e.jsx("span",{className:"btn-label",children:a.label}),e.jsx("span",{className:"btn-desc",children:a.desc})]})]}),e.jsx(q,{size:16,className:"chevron"})]},r))})]})}),l.map(a=>e.jsxs(o.div,{initial:{opacity:0,x:a.role==="user"?20:-20},animate:{opacity:1,x:0},className:`message-wrapper ${a.role}`,children:[e.jsxs("div",{className:"message-header",children:[a.role==="assistant"?e.jsx(b,{size:12}):e.jsx(J,{size:12}),e.jsx("span",{children:a.role==="assistant"?"ARIES COMMAND":"COMMANDER"}),e.jsx("span",{className:"msg-time",children:a.createdAt?g(new Date(a.createdAt),"HH:mm"):"--:--"})]}),e.jsxs("div",{className:"message-bubble",children:[e.jsx("div",{className:"bubble-content",children:a.content.split(`
`).map((r,s)=>e.jsx("p",{style:{marginBottom:r.trim()?"1.2rem":"0.5rem"},children:r},s))}),a.suggestedTasks&&a.suggestedTasks.length>0&&e.jsxs("div",{className:"suggested-tasks",children:[e.jsx("div",{className:"suggested-header",children:"SUGGESTED RECON TASKS"}),e.jsx("div",{className:"tasks-grid",children:a.suggestedTasks.map((r,s)=>{const t=y.some(i=>i.title.toLowerCase()===r.title.toLowerCase()&&!i.isCompleted);return e.jsxs("div",{className:"suggested-item",children:[e.jsxs("div",{className:"item-info",children:[e.jsxs("div",{className:"item-title",children:[r.title,t&&e.jsx("span",{className:"active-tag",children:"Active"})]}),e.jsxs("div",{className:"item-meta",children:[e.jsx("span",{className:`priority-tag ${String(r.priority||"medium").toLowerCase()}`,children:String(r.priority||"medium").toUpperCase()}),e.jsx("span",{className:"meta-separator",children:"•"}),e.jsxs("span",{className:"time-tag",children:[r.estimatedTime,"M"]}),e.jsx("span",{className:"meta-separator",children:"•"}),e.jsx("span",{className:"reason-tag",children:r.reason})]})]}),t?e.jsx("div",{className:"completed-icon-tag",children:e.jsx(Q,{size:16})}):e.jsx("button",{className:"add-task-icon-btn",onClick:()=>H(r),children:e.jsx(S,{size:16})})]},s)})})]})]})]},a.id)),c&&e.jsxs(o.div,{initial:{opacity:0,y:10},animate:{opacity:1,y:0},className:"message-wrapper assistant loading-state",children:[e.jsxs("div",{className:"message-header",children:[e.jsx(b,{size:12,className:"spinning-icon"}),e.jsx("span",{children:"ARIES PROCESSING..."})]}),e.jsxs("div",{className:"loading-bubble",children:[e.jsxs("div",{className:"loading-dots",children:[e.jsx("span",{}),e.jsx("span",{}),e.jsx("span",{})]}),e.jsx("div",{className:"loading-text",children:"Synchronizing neural pathways..."})]})]})]}),e.jsx("div",{ref:z,style:{height:1}})]}),e.jsxs("div",{className:"input-area",children:[j&&e.jsxs("div",{className:"error-toast",children:[e.jsx(Z,{size:14}),j]}),e.jsxs("div",{className:"input-feedback",children:[e.jsxs("div",{className:"neural-link",children:[e.jsx("div",{className:"link-dot"}),e.jsx("span",{children:"Neural Link Ready"})]}),e.jsxs("div",{className:"char-count",children:[d.length,"/2000"]})]}),e.jsxs("div",{className:"input-wrapper",children:[e.jsx("textarea",{value:d,onChange:a=>v(a.target.value.slice(0,2e3)),onKeyDown:a=>{a.key==="Enter"&&!a.shiftKey&&(a.preventDefault(),m())},placeholder:"Briefing code or strategic inquiry...",rows:1}),e.jsx("button",{className:`send-btn ${d.trim()?"active":""}`,onClick:()=>m(),disabled:c||!d.trim(),children:c?e.jsx(_,{size:18,className:"spin"}):e.jsx(ee,{size:18})})]}),e.jsxs("div",{className:"input-footer",children:[e.jsx(ae,{size:10}),e.jsx("span",{children:"ARIES may provide analytical errors. Verify mission-critical data."})]})]})]}),e.jsx("style",{children:`
                .assistant-layout {
                    display: grid;
                    grid-template-columns: 310px 1fr;
                    height: calc(100vh - 100px);
                    background: rgba(8, 8, 12, 0.4);
                    border-radius: 32px;
                    overflow: hidden;
                    border: 1px solid rgba(255,255,255,0.05);
                    box-shadow: 0 20px 50px rgba(0,0,0,0.3);
                    backdrop-filter: blur(20px);
                }

                .assistant-sidebar {
                    background: rgba(255,255,255,0.015);
                    border-right: 1px solid rgba(255,255,255,0.05);
                    display: flex;
                    flex-direction: column;
                    padding: 2rem;
                    overflow: hidden; /* CRITICAL: Prevent sidebar from expanding */
                }

                .new-chat-btn {
                    width: 100%;
                    padding: 1rem;
                    background: var(--gradient-primary);
                    border: none;
                    border-radius: 16px;
                    color: white;
                    font-weight: 800;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    cursor: pointer;
                    margin-bottom: 2.5rem;
                    box-shadow: 0 4px 15px rgba(var(--primary-rgb), 0.3);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    text-transform: uppercase;
                    font-size: 0.85rem;
                    letter-spacing: 1px;
                }

                .new-chat-btn:hover {
                    transform: translateY(-3px) scale(1.02);
                    box-shadow: 0 8px 25px rgba(var(--primary-rgb), 0.5);
                }

                .list-label {
                    font-size: 0.75rem;
                    font-weight: 900;
                    color: rgba(255,255,255,0.25);
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    margin-bottom: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .conversation-list {
                    flex: 1;
                    overflow-y: auto;
                    padding-right: 0.5rem;
                    scrollbar-width: none; /* Firefox */
                    -ms-overflow-style: none;  /* IE and Edge */
                    min-height: 0; /* Help flexbox know when to scroll */
                }

                .conversation-list::-webkit-scrollbar { 
                    display: none; /* Chrome, Safari and Opera */
                }

                .conv-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                    border-radius: 16px;
                    cursor: pointer;
                    transition: all 0.25s;
                    margin-bottom: 0.75rem;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.03);
                    position: relative;
                }

                .conv-item:hover {
                    background: rgba(255,255,255,0.06);
                    border-color: rgba(255,255,255,0.1);
                    transform: translateX(4px);
                }

                .conv-item.active {
                    background: rgba(var(--primary-rgb), 0.12);
                    border-color: rgba(var(--primary-rgb), 0.3);
                    box-shadow: 0 0 20px rgba(var(--primary-rgb), 0.1);
                }

                .conv-content {
                    flex: 1;
                    min-width: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .conv-title {
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: rgba(255,255,255,0.9);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .conv-date {
                    font-size: 0.75rem;
                    color: rgba(255,255,255,0.4);
                }

                .chat-header {
                    padding: 1.75rem 2.5rem;
                    background: rgba(255,255,255,0.01);
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    backdrop-filter: blur(10px);
                }

                .header-info { display: flex; align-items: center; gap: 1.25rem; }
                .header-text { display: flex; flex-direction: column; gap: 4px; }
                .header-top { display: flex; align-items: center; gap: 0.75rem; }
                .header-info h2 { font-size: 1.4rem; font-weight: 900; margin: 0; letter-spacing: 1px; color: white; }
                .header-info p { font-size: 0.85rem; color: rgba(255,255,255,0.4); margin: 0; }

                .status-badge {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 4px 10px;
                    background: rgba(34, 197, 94, 0.1);
                    border: 1px solid rgba(34, 197, 94, 0.2);
                    border-radius: 20px;
                    color: #22c55e;
                    font-size: 0.65rem;
                    font-weight: 900;
                    letter-spacing: 0.5px;
                }

                .status-badge.pulse span { animation: blink 2s infinite; }
                @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

                .icon-pulse {
                    padding: 12px;
                    background: rgba(var(--primary-rgb), 0.15);
                    border-radius: 16px;
                    box-shadow: 0 0 20px rgba(var(--primary-rgb), 0.2);
                }

                .chat-container {
                    padding: 2.5rem;
                    gap: 2rem;
                    scroll-behavior: smooth;
                    position: relative;
                    overflow-x: hidden;
                    flex: 1;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    min-height: 0; /* CRITICAL for flex scrolling */
                    scrollbar-width: none; /* Firefox */
                    -ms-overflow-style: none;  /* IE and Edge */
                }

                .chat-container::-webkit-scrollbar { 
                    display: none; /* Chrome, Safari and Opera */
                }

                .neural-grid {
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                                      linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
                    background-size: 30px 30px;
                    pointer-events: none;
                    opacity: 0.5;
                }

                .message-bubble {
                    padding: 1.5rem 2rem;
                    border-radius: 20px;
                    font-size: 1rem;
                    line-height: 1.6;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                    position: relative;
                }

                .user .message-bubble {
                    background: linear-gradient(135deg, var(--primary) 0%, #6d28d9 100%);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: white;
                    font-weight: 500;
                }

                .assistant .message-bubble {
                    background: rgba(18, 18, 28, 0.45);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(20px);
                    color: rgba(255, 255, 255, 0.9);
                    font-weight: 400;
                    letter-spacing: 0.2px;
                }

                .bubble-content p:last-child { margin-bottom: 0 !important; }

                .welcome-card {
                    padding: 4rem;
                    border-radius: 40px;
                    max-width: 650px;
                    text-align: center;
                    border: 1px solid rgba(255,255,255,0.1);
                    background: rgba(10, 10, 15, 0.4);
                    backdrop-filter: blur(20px);
                    z-index: 10;
                    margin: auto;
                }

                .welcome-icon-wrapper {
                    position: relative;
                    width: 120px;
                    height: 120px;
                    margin: 0 auto 2.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .icon-ring, .icon-ring-outer {
                    position: absolute;
                    border: 2px dashed var(--primary);
                    border-radius: 50%;
                    opacity: 0.2;
                }

                .icon-ring { width: 100%; height: 100%; }
                .icon-ring-outer { width: 140%; height: 140%; opacity: 0.1; }

                .welcome-primary-icon {
                    color: var(--primary);
                    filter: drop-shadow(0 0 25px rgba(var(--primary-rgb), 0.6));
                }

                .welcome-card h3 { font-size: 2.2rem; font-weight: 900; margin-bottom: 1rem; color: white; letter-spacing: -0.5px; }
                .welcome-card p { font-size: 1.05rem; color: rgba(255,255,255,0.5); line-height: 1.6; margin-bottom: 2.5rem; max-width: 480px; margin-left: auto; margin-right: auto; }

                .suggestion-btn {
                    padding: 1rem 1.75rem !important;
                    background: rgba(255,255,255,0.02) !important;
                    border: 1px solid rgba(255,255,255,0.04) !important;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-radius: 20px;
                    color: white;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    width: 100%;
                }

                .btn-icon-box {
                    width: 40px; height: 40px;
                    background: rgba(var(--primary-rgb), 0.1);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .btn-left { display: flex; align-items: center; gap: 1rem; text-align: left; }

                .btn-text-content {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .btn-label { font-size: 0.95rem; font-weight: 700; color: white; }
                .btn-desc { font-size: 0.75rem; color: rgba(255,255,255,0.3); font-weight: 500; }

                .loading-bubble {
                    background: rgba(20, 20, 30, 0.5);
                    border: 1px solid rgba(var(--primary-rgb), 0.2);
                    box-shadow: 0 0 20px rgba(var(--primary-rgb), 0.1);
                    padding: 1rem 1.5rem;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }

                .suggested-tasks {
                    margin-top: 1.5rem;
                    padding: 1.5rem;
                    background: rgba(0,0,0,0.25);
                    border-radius: 16px;
                    border: 1px solid rgba(255,255,255,0.03);
                }

                .suggested-header {
                    font-size: 0.7rem;
                    font-weight: 800;
                    letter-spacing: 0.1em;
                    color: rgba(255,255,255,0.25);
                    margin-bottom: 1.25rem;
                    text-transform: uppercase;
                }

                .tasks-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .suggested-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1rem 1.25rem;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.03);
                    border-radius: 12px;
                    transition: all 0.2s ease;
                }

                .suggested-item:hover {
                    background: rgba(255,255,255,0.04);
                    border-color: rgba(255,255,255,0.06);
                }

                .item-title {
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: white;
                    margin-bottom: 0.35rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .item-meta {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.75rem;
                    color: rgba(255,255,255,0.4);
                    font-weight: 500;
                }

                .priority-tag { font-weight: 700; font-size: 0.65rem; }
                .priority-tag.high { color: #f87171; }
                .priority-tag.medium { color: #fbbf24; }
                .priority-tag.low { color: #34d399; }
                .priority-tag.critical { color: #ef4444; }

                .meta-separator { opacity: 0.2; }
                .reason-tag { color: rgba(255,255,255,0.3); }

                .add-task-icon-btn {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: #22c55e;
                    border: none;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 0 15px rgba(34, 197, 94, 0.3);
                }

                .add-task-icon-btn:hover {
                    transform: scale(1.1);
                    box-shadow: 0 0 20px rgba(34, 197, 94, 0.5);
                }

                .completed-icon-tag {
                    color: #22c55e;
                    opacity: 0.6;
                }

                .input-feedback {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.75rem;
                    padding: 0 0.5rem;
                }

                .neural-link {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.7rem;
                    font-weight: 800;
                    color: #7c6cf0;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .edge-badge {
                    font-size: 0.6rem;
                    font-weight: 900;
                    background: #fff;
                    color: #000;
                    padding: 1px 4px;
                    border-radius: 3px;
                    margin-left: 8px;
                    letter-spacing: 0.5px;
                }

                .link-dot {
                    width: 6px; height: 6px;
                    background: #7c6cf0;
                    border-radius: 50%;
                    box-shadow: 0 0 8px #7c6cf0;
                    animation: blink 1.5s infinite;
                }

                .char-count {
                    font-size: 0.7rem;
                    color: rgba(255,255,255,0.3);
                    font-weight: 600;
                }

                .input-footer {
                    margin-top: 0.75rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    font-size: 0.65rem;
                    color: rgba(255,255,255,0.2);
                    font-weight: 500;
                }

                .chat-main {
                    display: flex;
                    flex-direction: column;
                    background: rgba(0,0,0,0.1);
                    flex: 1;
                    overflow: hidden; /* Prevent parent from expanding */
                    min-width: 0;
                }

                .message-wrapper {
                    display: flex;
                    flex-direction: column;
                    max-width: 80%;
                    z-index: 5;
                }

                .message-wrapper.user { align-self: flex-end; }
                .message-wrapper.assistant { align-self: flex-start; }

                .message-header {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.7rem;
                    font-weight: 800;
                    letter-spacing: 0.05em;
                    color: rgba(255,255,255,0.3);
                    margin-bottom: 0.5rem;
                    padding: 0 0.5rem;
                }

                .user .message-header { flex-direction: row-reverse; }

                .input-area {
                    padding: 2rem 2.5rem;
                    background: rgba(0,0,0,0.3);
                    backdrop-filter: blur(20px);
                }

                .input-wrapper {
                    position: relative;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 24px;
                    padding: 0.75rem;
                    display: flex;
                    align-items: flex-end;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .input-wrapper textarea {
                    flex: 1;
                    background: none;
                    border: none;
                    color: white;
                    padding: 0.75rem 1.25rem;
                    resize: none;
                    font-size: 1.1rem;
                    max-height: 150px;
                }

                .input-wrapper textarea:focus { outline: none; }

                .send-btn {
                    width: 48px;
                    height: 48px;
                    background: rgba(255,255,255,0.05);
                    border: none;
                    border-radius: 16px;
                    color: rgba(255,255,255,0.2);
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .send-btn.active {
                    background: var(--gradient-primary);
                    color: white;
                    box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3);
                }

                .loading-dots {
                    display: flex;
                    gap: 6px;
                }

                .loading-dots span {
                    width: 6px; height: 6px;
                    background: var(--primary);
                    border-radius: 50%;
                    animation: dotPulse 1.4s infinite;
                }

                @keyframes dotPulse {
                    0%, 100% { opacity: 0.2; transform: scale(0.8); }
                    50% { opacity: 1; transform: scale(1.2); }
                }

                .spinning-icon { animation: spin 4s linear infinite; color: var(--primary); }
                @keyframes spin { from { rotate: 0deg; } to { rotate: 360deg; } }

                .conv-content { display: flex; flex-direction: column; }
                .conv-title { font-weight: 700; color: white; }
                .conv-delete { background: none; border: none; color: rgba(255,255,255,0.2); cursor: pointer; padding: 4px; border-radius: 4px; }
                .conv-delete:hover { color: #ff5252; background: rgba(255, 82, 82, 0.1); }
                .header-actions { display: flex; gap: 0.5rem; }
                .action-btn { background: rgba(255,255,255,0.05); border: none; color: white; padding: 8px; border-radius: 10px; cursor: pointer; }

                .desktop-only { display: block; }
                .mobile-menu-toggle { display: none; }
                .sidebar-mobile-header { display: none; }
                .sidebar-overlay { 
                    display: none; 
                    position: fixed; 
                    top: 0; left: 0; right: 0; bottom: 0; 
                    background: rgba(0,0,0,0.6); 
                    z-index: 100; 
                    backdrop-filter: blur(4px);
                }

                @media (max-width: 1024px) {
                    .assistant-layout { 
                        grid-template-columns: 1fr; 
                        border-radius: 0;
                        height: calc(100vh - 80px); /* Adjust for mobile header */
                    }

                    .assistant-sidebar { 
                        position: fixed;
                        top: 0; left: 0; bottom: 0;
                        width: 280px;
                        z-index: 101;
                        background: #0a0a0f;
                        transform: translateX(-100%);
                        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        box-shadow: 20px 0 50px rgba(0,0,0,0.5);
                    }

                    .assistant-sidebar.mobile-open {
                        transform: translateX(0);
                    }

                    .sidebar-mobile-header {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding-bottom: 2rem;
                        color: white;
                        font-weight: 800;
                        font-size: 0.8rem;
                        letter-spacing: 2px;
                    }

                    .sidebar-mobile-header button {
                        background: rgba(255,255,255,0.05);
                        border: none;
                        color: white;
                        width: 36px; height: 36px;
                        border-radius: 10px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }

                    .chat-header {
                        padding: 1rem 1.5rem;
                        gap: 1rem;
                    }

                    .mobile-menu-toggle {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: rgba(var(--primary-rgb), 0.1);
                        border: 1px solid rgba(var(--primary-rgb), 0.2);
                        color: var(--primary);
                        width: 40px; height: 40px;
                        border-radius: 12px;
                        cursor: pointer;
                    }

                    .desktop-only { display: none; }
                    .header-info h2 { font-size: 1.1rem; }
                    .header-info p { display: none; }
                    .status-badge { padding: 3px 8px; font-size: 0.55rem; }

                    .chat-container { padding: 1.5rem; }
                    .welcome-card { padding: 2.5rem 1.5rem; border-radius: 24px; }
                    .welcome-card h3 { font-size: 1.5rem; }
                    .welcome-card p { font-size: 0.9rem; }
                    .system-stats { flex-wrap: wrap; }
                    .message-wrapper { max-width: 90%; }
                    .message-bubble { padding: 1rem; font-size: 0.95rem; }

                    .input-area { padding: 1rem 1.5rem; }
                    .input-wrapper textarea { font-size: 1rem; padding: 0.5rem 1rem; }
                    .send-btn { width: 44px; height: 44px; }
                    
                    .sidebar-overlay { display: block; }
                }

                @media (max-width: 480px) {
                    .assistant-layout { height: calc(100vh - 60px); }
                    .welcome-icon-wrapper { width: 80px; height: 80px; margin-bottom: 1.5rem; }
                    .welcome-primary-icon { width: 32px; height: 32px; }
                    .icon-ring-outer { display: none; }
                }
            `})]})}export{le as default};
