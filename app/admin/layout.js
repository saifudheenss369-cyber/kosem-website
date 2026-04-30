import AdminLayoutClient from './AdminLayoutClient';

export const metadata = {
    title: 'Admin Dashboard',
};

export default function AdminLayout({ children }) {
    return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
