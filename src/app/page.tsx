"use client";

import LoadingBubble from "./components/LoadingBubble";
import PromptSuggesstionRow from "./components/PromptSuggesstionRow";
import Bubble from "./components/Bubble";
import useChat from

const Home = () => {
  const {
    append,
    isLoading,
    messages,
    input,
    handleInputChange,
    handleSubmit,
  } = useChat();

  const noMessages = !messages || messages.length === 0;

  const handlePrompt = (promptText: string) => {
    const msg = {
      id: crypto.randomUUID(),
      content: promptText,
      role: "user",
    };

    append(msg);
  };

  return (
    <main>
      <section>
        {noMessages ? (
          <>
            <p className="starter-text">
              The Ultimate place for Formula One super fans! ASK F!GPT anything
              about Formula 1 and it will respond with up-to-date answers.
            </p>

            <br />

            <PromptSuggesstionRow onPromptClick={handlePrompt} />
          </>
        ) : (
          <>
            {messages.map((msg, index) => (
              <Bubble key={`message-${index}`} message={msg} />
            ))}

            {isLoading && <LoadingBubble />}
          </>
        )}
      </section>

      <form onSubmit={handleSubmit}>
        <input
          className="question-box"
          onChange={handleInputChange}
          value={input}
          placeholder="Ask me something..."
        />

        <button type="submit">Send</button>
      </form>
    </main>
  );
};

export default Home;