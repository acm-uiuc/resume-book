import { useState, useRef, FC } from "react";

interface AutocompleteProps {
  src: string[];
}

const Autocomplete: FC<AutocompleteProps> = ({ src }) => {
  const originals = src.map((elem) => elem.toLowerCase());
  const [results, setResults] = useState<string[]>(originals);
  const [search, setSearch] = useState("");
  const [isFocused, setIsFocused] = useState<boolean>(false);

  return (
    <>
      <input
        value={search}
        onChange={(e) => {
          const field = e.target.value;

          setSearch(field);

          // let field = !searchRef.current?.value ? "" : searchRef.current.value;

          if (field === "") setResults(originals);
          else
            setResults((prev) => {
              return prev.filter((item) => {
                return item.includes(field);
              });
            });
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        type="text"
        placeholder="Type here"
        className=" w-56 h-7 flex-shrink rounded-xl leading-loose text-sm border-2 border-slate-300 focus:outline-none bg-slate-200 px-4 py-5"
      />
      {isFocused && results.length > 0 ? (
        <div className=" scrollbar-hide w-56 max-h-36 min-h-fit overflow-y-scroll flex flex-col z-10 rounded-xl border-2 border-slate-300 translate-y-[-2px] ">
          {results.map((item, index) => {
            if (index == results.length - 1)
              return (
                <div
                  onMouseDown={() => {
                    setSearch(item[0].toUpperCase() + item.slice(1));
                  }}
                  className="text-sm py-2 px-4 hover:bg-slate-400 hover:text-white capitalize"
                >
                  {item}
                </div>
              );
            return (
              <div
                className="text-sm border-b-2 border-slate-300 py-2 px-4 hover:bg-slate-400 hover:text-white capitalize"
                onMouseDown={() => {
                  setSearch(item[0].toUpperCase() + item.slice(1));
                }}
              >
                {item}
              </div>
            );
          })}
        </div>
      ) : null}
    </>
  );
};

export { Autocomplete };
