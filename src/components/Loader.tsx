type LoaderProps = {
  text?: string;
};

// One loading message for the whole site, shown while data is coming from the server.
function Loader({ text = 'טוען...' }: LoaderProps) {
  return <p className="loader">{text}</p>;
}

export default Loader;
