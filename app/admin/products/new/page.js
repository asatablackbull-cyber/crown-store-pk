'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProductForm from '../ProductForm';

export default function NewProductPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || user.role !== 'admin') {
      router.push('/login');
    }
  }, [router]);

  return <ProductForm mode="add" product={null} />;
}
