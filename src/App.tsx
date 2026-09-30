import { PerspectiveRoom } from './components/perspective';

export default function App() {
  return (
    <main className="relative w-full min-h-screen">
      <PerspectiveRoom
        strokeWidth={1}
        boundaryStrokeWidth={1.6}
      />
    </main>
  );
}
