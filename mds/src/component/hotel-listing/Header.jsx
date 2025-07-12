import { SearchBar } from "./SearchBar";



export function Header() {
  return (
    <header className="bg-gray-50 py-6">
      <div className="container mx-auto px-4">
        <SearchBar />
      </div>
    </header>
  )
}
