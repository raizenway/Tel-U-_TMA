'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import FormMaturity from '@/components/FormMaturity';


type MaturityType = {
  level: string;
  namaLevel: string;
  skorMin: string;
  skorMax: string;
  deskripsiUmum: string;
  deskripsiList?: string[];
};

export default function EditMaturityPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<MaturityType | null>(null);

  useEffect(() => {
    setData({
      level: '2',
      namaLevel: 'Level Menengah',
      skorMin: '60',
      skorMax: '79',
      deskripsiUmum: 'Tingkat kematangan sedang...',
      deskripsiList: ['Variabel A sedang', 'Variabel B cukup'],
    });
  }, [id]);

  const handleSave = (updatedData: MaturityType) => {
    console.log('Edit data:', updatedData);
  };

  if (!data) return <div>Loading...</div>;

  return (
    <FormMaturity
      mode="edit"
      initialData={data}
      onSave={handleSave}
      onCancel={() => router.back()}
    />
  );
}
