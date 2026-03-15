import { SearchIcon } from 'lucide-react'
import { InputGroup, InputGroupAddon } from './selia/input-group'
import { Input } from './selia/input'
import { Button } from './selia/button'
import { Text } from './selia/text'
import { getRouteApi, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

const Route = getRouteApi('/__authed/')

export function PromptSearch() {
  const [value, setValue] = useState('')
  const search = Route.useSearch()
  const navigate = useNavigate()

  useEffect(() => {
    setValue(search.query || '')
  }, [search.query])

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const query = event.currentTarget.query.value
    navigate({
      to: '/',
      search: {
        query,
      },
    })
  }
  return (
    <form className="mb-6" onSubmit={handleSearch}>
      <InputGroup>
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <Input
          placeholder="Search prompt"
          name="query"
          autoComplete="off"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <InputGroupAddon align="end">
          <Button variant="outline" type="submit">
            Search
          </Button>
        </InputGroupAddon>
      </InputGroup>
      {search.query && (
        <Text className="text-muted mt-2 flex justify-between items-center">
          <p>Result for '{search.query}'.</p>
          <Link to="/" search={{ query: undefined }} className="underline">
            Clear Search
          </Link>
        </Text>
      )}
    </form>
  )
}
