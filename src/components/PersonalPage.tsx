import { Navigate, NavLink, useParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import PatientsTab from './PatientsTab';
import MyTasksTab from './MyTasksTab';
import ProfileTab from './ProfileTab';

function PersonalPage() {
  const { token } = useAuth();
  const { tab } = useParams();

  if (!token) return <Navigate to="/login" />;
  if (tab !== 'patients' && tab !== 'tasks' && tab !== 'profile') {
    return <Navigate to="/me/patients" />;
  }

  return (
    <section className="personal">
      <h1>אזור אישי</h1>

      <nav className="tabs">
        <NavLink to="/me/patients">מטופלים</NavLink>
        <NavLink to="/me/tasks">משימות</NavLink>
        <NavLink to="/me/profile">פרופיל</NavLink>
      </nav>

      {tab === 'patients' && <PatientsTab />}
      {tab === 'tasks' && <MyTasksTab />}
      {tab === 'profile' && <ProfileTab />}
    </section>
  );
}

export default PersonalPage;
