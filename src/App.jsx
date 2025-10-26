import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

function App() {
  const [chatHistory, setChatHistory] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [generatingAnswer, setGeneratingAnswer] = useState(false);

  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, generatingAnswer]);

  async function generateAnswer(e) {
    e.preventDefault();
    if (!question.trim()) return;

    setGeneratingAnswer(true);
    const currentQuestion = question;
    setQuestion("");

    setChatHistory(prev => [...prev, { type: 'question', content: currentQuestion }]);

    try {

      const response = await fetch('https://projectaichatappbackend.vercel.app/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: question }),
      }).then(res => res.json()).catch(err => { throw err });


      setChatHistory(prev => [...prev, { type: 'answer', content: response.text }]);

      setAnswer(response.text);

    } catch (error) {
      setAnswer("Sorry - Something went wrong. Please try again!");
      setChatHistory(prev => [...prev, { type: 'answer', content: "Sorry - Something went wrong. Please try again!" }]);
    }
    setGeneratingAnswer(false);
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-r from-gray-80 to-gray-80">
      <div className="h-full max-w-4xl mx-auto flex flex-col p-3">
        {/* Fixed Header */}
        <header className="text-center py-4">

          <h1 className="text-4xl font-bold text-blue-500 hover:text-blue-600 transition-colors">
            AI Chat App
          </h1>

        </header>

        {/* Scrollable Chat Container - Updated className */}
        {chatHistory.length > 0 ? <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto mb-4 rounded-2xl bg-white shadow-lg p-4 hide-scrollbar"
        >
          <>
            {chatHistory.map((chat, index) => (
              <div key={index} className={`mb-4 ${chat.type === 'question' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block max-w-[80%] p-3 rounded-lg overflow-auto hide-scrollbar ${chat.type === 'question'
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}>
                  <div className="overflow-auto hide-scrollbar">
                    <ReactMarkdown >{chat.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
          </>

          {generatingAnswer && (
            <div className="text-left">
              <div className="inline-block bg-gray-100 p-3 rounded-lg animate-pulse">
                Thinking...
              </div>
            </div>
          )}
        </div> :
          <div className="flex-1 mb-4 rounded-2xl bg-white shadow-lg p-4 grid text-center items-center text-xl" >
            What are you working on today? <br />Ask me anything!
          </div>
        }

        {/* Fixed Input Form */}
        <form onSubmit={generateAnswer} className="bg-white rounded-2xl shadow-lg p-4">
          <div className="flex gap-2">
            <textarea
              required
              id="textArea"
              className="flex-1 border border-gray-300 rounded-2xl p-3 pr-[43px] focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask anything..."
              rows="2"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  generateAnswer(e);
                }
              }}
            ></textarea>
            <button
              type="submit"
              className={` ml-[-48px] py-1 my-[2px] h-[70px] bg-white text-white rounded-2xl hover:bg-blue-100 transition-colors ${generatingAnswer ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              disabled={generatingAnswer}
            >
              <img src="public/assets/arrowicon.png" alt="Arrow Icon" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
