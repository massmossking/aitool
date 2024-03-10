//聊天界面
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Chat() {
  const router = useRouter();
  const { id } = router.query;

  const [messages, setMessages] = useState([{ text: "I'm really upset right now.", sender: 'bot' }]);
  const [inputValue, setInputValue] = useState('');
  const [conversationCount, setConversationCount] = useState(0);
  const [forgivenessLevel, setForgivenessLevel] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (conversationCount >= 10 || forgivenessLevel >= 100) {
      setShowModal(true);
      setSuccess(forgivenessLevel >= 100);
    }
  }, [conversationCount, forgivenessLevel]);

  const handleInput = (event) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (inputValue.trim() === '') return;

    const userMessage = inputValue;
    setMessages([...messages, { text: userMessage, sender: 'user' }]);
    setInputValue('');
    setConversationCount(conversationCount + 1);

    // Fetching AI response
    const response = await fetch('/api/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: userMessage }),
    });

    if (response.ok) {
      const { response: aiResponse } = await response.json();
      setMessages((prevMessages) => [...prevMessages, { text: aiResponse, sender: 'bot' }]);
      // Update forgiveness level based on AI response (this should be more sophisticated in a real application)
      setForgivenessLevel(Math.min(100, forgivenessLevel + 10));
    } else {
      console.error('Failed to fetch AI response');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Chat Scenario {id}</h1>
      <p>Conversations: {conversationCount} / 10</p>
      <p>Forgiveness Level: {forgivenessLevel}%</p>
      <div className="chat-box bg-gray-200 p-4 my-4">
        {messages.map((message, index) => (
          <p key={index} className={message.sender === 'bot' ? 'text-red-500' : 'text-green-500'}>
            {message.text}
          </p>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInput}
          className="border-2 border-gray-300 p-2 w-full"
          placeholder="Type your message..."
        />
        <button type="submit" className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">Send</button>
      </form>

      {showModal && (
        <div className="modal bg-white p-4 rounded-lg shadow-lg text-center">
          {success ? (
            <>
              <h2 className="text-xl font-bold">Congratulations! You've succeeded!</h2>
              <p>You resolved the scenario with fewer conversations than X% of other users.</p>
              <p>Feel free to share your success on social media and challenge a friend!</p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold">Unfortunately, you didn't succeed.</h2>
              <p>Consider trying again or share the scenario on social media to get help from a friend!</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

