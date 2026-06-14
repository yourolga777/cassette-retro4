import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MDXRemoteProps {
  content: string;
}

export function MDXRemote({ content }: MDXRemoteProps) {
  return (
    <Markdown remarkPlugins={[remarkGfm]}>
      {content}
    </Markdown>
  );
}
