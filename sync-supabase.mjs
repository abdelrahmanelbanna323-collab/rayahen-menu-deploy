import fs from 'fs';
const stateStr = fs.readFileSync('d:/Projects/rayahen-admin-deploy/scratch/final_state.json', 'utf8');
const state = JSON.parse(stateStr).data;
const url = 'https://acmmilazknnircuquozr.supabase.co/rest/v1/menu_state?id=eq.global';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjbW1pbGF6a25uaXJjdXF1b3pyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDI2Mzg2MSwiZXhwIjoyMTA1ODM5ODYxfQ.lmU3QDrhrxDcEz7ZXFxKJx6pE3qMZYL2SSaJ74buFKs';
const updatedAt = new Date().toISOString();
const sanitize = (obj) => {
    if(Array.isArray(obj)) return obj.map(sanitize);
    if(obj !== null && typeof obj === 'object') {
        const res = {};
        for(const [k, v] of Object.entries(obj)) {
            if(v !== undefined) res[k] = sanitize(v);
        }
        return res;
    }
    return obj;
};
const payload = {
    data: {
        categories: { data: sanitize(state.categories), updatedAt },
        menuItems: { data: sanitize(state.menuItems), updatedAt },
        promotions: { data: sanitize(state.promotions), updatedAt },
        announcements: { data: sanitize(state.announcements), updatedAt },
        settings: {
            adminUsers: [{passwordHash: '202026', username: 'admin', id: '1', role: 'SUPER_ADMIN'}],
            ratingUrl: state.ratingUrl || '',
            vatSettings: state.vatSettings || {},
            updatedAt
        }
    }
};
fetch(url, {
    method: 'PATCH',
    headers: {
        'Content-Type': 'application/json',
        'apikey': key,
        'Authorization': 'Bearer ' + key
    },
    body: JSON.stringify(payload)
}).then(r => r.text()).then(console.log).catch(console.error);
