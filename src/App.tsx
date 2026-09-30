import { PerspectiveRoom } from './components/perspective';

export default function App() {
  return (
    <main className="relative w-full bg-[#fafafa]">
      <PerspectiveRoom
        strokeColor="#0a0a0a"
        backgroundColor="#fafafa"
        strokeWidth={1}
        boundaryStrokeWidth={1.6}
      />
    </main>
  );
}
