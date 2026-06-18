import { useState } from 'react';
import DashboardLayout from './components/DashboardLayout';
import Home from './views/Home';
import RagExploration from './views/RagExploration';
import StructuredExtraction from './views/StructuredExtraction';
import AwsExploration from './views/AwsExploration';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'structured-extraction' | 'rag-exploration' | 'aws-exploration'>('home');

  const handleSelectProject = (id: string) => {
    if (id === 'structured-extraction' || id === 'rag-exploration' || id === 'aws-exploration') {
      setCurrentPage(id);
    }
  };

  const handleBack = () => {
    setCurrentPage('home');
  };

  return (
    <DashboardLayout>
      {currentPage === 'home' && <Home onSelectProject={handleSelectProject} />}
      {currentPage === 'structured-extraction' && <StructuredExtraction onBack={handleBack} />}
      {currentPage === 'rag-exploration' && <RagExploration onBack={handleBack} />}
      {currentPage === 'aws-exploration' && <AwsExploration onBack={handleBack} />}
    </DashboardLayout>
  );
}

