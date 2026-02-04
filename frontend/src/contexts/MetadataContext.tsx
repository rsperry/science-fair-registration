import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getFairMetadata } from '../services/api';

interface Metadata {
  school: string;
  contactEmail: string;
  registrationDeadline: string;
  scienceFairDate: string;
}

interface MetadataContextType {
  metadata: Metadata;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const MetadataContext = createContext<MetadataContextType | undefined>(undefined);

export const MetadataProvider = ({ children }: { children: ReactNode }) => {
  const [metadata, setMetadata] = useState<Metadata>({
    school: '',
    contactEmail: '',
    registrationDeadline: '',
    scienceFairDate: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMetadata = async (retryCount = 0) => {
    try {
      const data = await getFairMetadata();
      setMetadata(data);
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load metadata:', err);
      
      // Retry up to 3 times with exponential backoff
      if (retryCount < 3) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 5000); // 1s, 2s, 4s max
        console.log(`Retrying metadata fetch in ${delay}ms... (attempt ${retryCount + 1}/3)`);
        setTimeout(() => loadMetadata(retryCount + 1), delay);
      } else {
        setError('Unable to load science fair information. Please try again later or contact support.');
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadMetadata();
  }, []);

  const refetch = () => {
    setLoading(true);
    setError(null);
    loadMetadata();
  };

  return (
    <MetadataContext.Provider value={{ metadata, loading, error, refetch }}>
      {children}
    </MetadataContext.Provider>
  );
};

export const useMetadata = () => {
  const context = useContext(MetadataContext);
  if (context === undefined) {
    throw new Error('useMetadata must be used within a MetadataProvider');
  }
  return context;
};
