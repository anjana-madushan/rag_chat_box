import { Message } from "@ai-sdk/react";

const Bubble = ({ message }: { message: Message }) => {
  const { content, role, parts } = message;

  console.log("content:", content);
  console.log("parts:", parts);

  const text = parts
    ?.filter((p) => p.type === "text")
    .map((p) => p.text)
    .join("") || content;

  return (
    <div className={`${role} bubble`}>{text}</div>
  );
};

export default Bubble