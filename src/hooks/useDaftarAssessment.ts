import { useState, useEffect } from 'react';
import { 
  listQuestions, 
  createQuestion, 
  updateQuestion, 
  getQuestionById, 
  deleteQuestion 
} from '@/lib/api-daftar-assessment';
import { 
  Question, 
  CreateQuestionRequest, 
  UpdateQuestionRequest 
} from '@/interfaces/daftar-assessment';
import { ApiResponse } from '@/interfaces/api-response';
// ✅ Hook untuk list — return full ApiResponse
export const useQuestionList = () => {
  const [data, setData] = useState<Question[]>([]); // <-- ubah jadi array
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const response: ApiResponse<Question[]> = await listQuestions();

      if (response.status === 'success') {
        setData(response.data); // <-- simpan HANYA array-nya
      } else {
        setError(response.message || 'Gagal memuat data dari server.');
        setData([]);
      }
    } catch (err) {
      console.error('🚨 Error saat memuat pertanyaan:', err);
      setError('Tidak dapat terhubung ke server. Periksa koneksi atau server backend.');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, []);

  return { data, loading, error, refetch }; // <-- data = Question[]
};

// ✅ Hook untuk create
export const useCreateQuestion = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (body: CreateQuestionRequest): Promise<Question | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await createQuestion(body);
      if (res.status === 'success') {
        return res.data;
      } else {
        setError(res.message || 'Gagal membuat pertanyaan');
        return null;
      }
    } catch (err: any) {
      const message = err.message || 'Tidak dapat terhubung ke server';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
};

// ✅ Hook untuk update
export const useUpdateQuestion = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (
    id: number,
    body: UpdateQuestionRequest
  ): Promise<Question | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await updateQuestion(id, body);
      if (res.status === 'success') {
        return res.data;
      } else {
        setError(res.message || 'Gagal memperbarui pertanyaan');
        return null;
      }
    } catch (err: any) {
      const message = err.message || 'Tidak dapat terhubung ke server';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
};

// ✅ Hook untuk get by id
export const useGetQuestionById = (id: number) => {
  const [data, setData] = useState<Question | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || isNaN(id)) {
      setError('ID tidak valid');
      setData(null);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log(`[API] Fetching question with ID: ${id}`); 

        const response = await getQuestionById(id);

        if (response.status === 'success') {
          if (response.data) {
            setData(response.data);
          } else {
            setError('Data tidak ditemukan di server.');
            setData(null);
          }
        } else {
          setError(response.message || 'Gagal memuat data dari server');
          setData(null);
        }
      } catch (err: any) {
        const errorMessage = err.message 
          ? `Network error: ${err.message}` 
          : 'Tidak dapat terhubung ke server';
        
        console.error('🚨 Error fetching question:', err); 
        setError(errorMessage);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return { data, loading, error };
};

// ✅ Hook untuk delete
export const useDeleteQuestion = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await deleteQuestion(id);
      if (res.status === 'success') {
        return true;
      } else {
        setError(res.message || 'Gagal menghapus pertanyaan');
        return false;
      }
    } catch (err: any) {
      const message = err.message || 'Tidak dapat terhubung ke server';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
};
