import React,{useState} from 'react';
import Auth from './pages/AuthPage';
import Editor from './pages/EditorPage';
import Community from './pages/CommunityPage';
export default function App(){
const [user,setUser]=useState(null);
if(!user) return <Auth onLogin={setUser}/>;
return <Editor user={user} onLogout={()=>setUser(null)}/>;
}
