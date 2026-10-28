import { Link, Route, Routes } from 'react-router-dom';
import BoardPage from './components/BoardPage';
import LoginPage from './components/LoginPage';
import MessagesPage from './components/MessagesPage';
import PersonalPage from './components/PersonalPage';
import PatientPage from './components/PatientPage';
import RegisterPage from './components/RegisterPage';
import AdminPage from './components/AdminPage';
import TaskFormPage from './components/TaskFormPage';
import { useAuth } from './AuthContext';
import MessagesLink from './components/MessagesLink';
import RequestsPopup from './components/RequestsPopup';

function App() {
  const { user, logout } = useAuth();

  return (
    <main>
      <nav className="top-nav">
        <Link to="/" className="brand">
          <span className="brand-mark">✚</span>
          ShiftUp
        </Link>
        <Link to="/">לוח המשימות</Link>
        {user && <MessagesLink key={user.id} />}
        {user && <Link to="/me">אזור אישי</Link>}
        {user?.role === 'admin' && <Link to="/tasks/new">משימה חדשה</Link>}
        {user?.role === 'admin' && <Link to="/admin">ניהול</Link>}
        {user ? (
          <>
            <span className="nav-user">שלום, {user.full_name}</span>
            <button className="nav-logout" onClick={logout}>יציאה</button>
          </>
        ) : (
          <>
            <Link to="/login">כניסה</Link>
            <Link to="/register">הרשמה</Link>
          </>
        )}
      </nav>

      <Routes>
        <Route path="/" element={<BoardPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/me" element={<PersonalPage />} />
        <Route path="/me/:tab" element={<PersonalPage />} />
        <Route path="/patients/:patientId" element={<PatientPage />} />
        <Route path="/tasks/new" element={<TaskFormPage />} />
        <Route path="/tasks/:taskId/edit" element={<TaskFormPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/:tab" element={<AdminPage />} />
      </Routes>

      <RequestsPopup key={user?.id} />
    </main>
  );
}

export default App;
