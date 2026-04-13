import { redirect } from 'next/navigation';

export default function AdminUserViewRedirectPage() {
  redirect('/admin/users');
}
