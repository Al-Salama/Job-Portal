import React, { useEffect, useState } from 'react';

function fetchAdmin() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(false);
    }, 1000);
  })
}

function App() {
  const [isLoading, setLoading] = useState(true);
  const [isAdmin, setAdmin] = useState(false);
  const [isError, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setAdmin(false);
    setError(false);

    fetchAdmin().then(result => {
      setAdmin(result);
    }).catch(err => {
      setError(true);
    }).finally(_=> {
      setLoading(false);
    })
  }, [])


  return isLoading ? (
      <h1>isLoading...</h1>
    ) : isError ? (
      <h1>isError!!</h1>
    ) : isAdmin ? (
      <h1>isAdmin</h1>
    ) : (
      <h1>Not allowed</h1>
    )
}

export default App;