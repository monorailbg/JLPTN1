import PastTestsView from '@/components/past-tests/PastTestsView';

export const metadata = {
  title: '過去問データベース — JLPT N1 Trainer',
  description: 'Which N1 vocabulary and grammar patterns have appeared most often in past tests (2010–2023)',
};

export default function PastTestsPage() {
  return <PastTestsView />;
}
