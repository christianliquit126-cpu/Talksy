import { useParams, useNavigate } from 'react-router-dom';
import PrivateChatWindow from '../components/PrivateChatWindow';

export default function PrivateChatPage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="h-full">
      <PrivateChatWindow
        otherUserId={userId}
        onBack={() => navigate('/chat')}
      />
    </div>
  );
}
