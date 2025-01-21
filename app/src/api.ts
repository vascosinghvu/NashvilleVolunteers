export const api: any = {
  get: async (route: string): Promise<any> => {
    const url = `${process.env.REACT_APP_API_URL as string}${route}`

    return await fetch(url, {
      method: "GET",
      headers: { "Access-Control-Allow-Origin": "*", mode: "no-cors" },
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok")
        }
        const json = await res.json()
        const response = {
          data: json,
          status: res.status,
        }

        return response
      })
      .catch((err) => {
        console.error("Error fetching data: ", err)
        throw err
      })
  },

  post: async (route: string, payload: any): Promise<any> => {
    const url = `${process.env.REACT_APP_API_URL as string}${route}`

    return await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        mode: "no-cors",
      },
      body: payload,
    })
      .then(async (res) => {
        const json = await res.json()
        const response = {
          data: json,
          status: res.status,
        }
        return response
      })
      .catch((err) => {
        console.error("Error posting data: ", err)
        throw err
      })
  },

  put: async (route: string, data: any): Promise<any> => {
    const url = `${process.env.REACT_APP_API_URL as string}${route}`

    return await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        mode: "no-cors",
      },
      body: data,
    })
      .then(async (res) => {
        const json = await res.json()
        const response = {
          data: json,
          status: res.status,
        }
        return response
      })
      .catch((err) => {
        console.error("Error posting data: ", err)
        throw err
      })
  },

  delete: async (route: string, data: any): Promise<any> => {
    const url = `${process.env.REACT_APP_API_URL as string}${route}`

    return await fetch(url, {
      method: "DELETE",
      headers: {
        "Access-Control-Allow-Origin": "*",
        mode: "no-cors",
      },
      body: data,
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok")
        }
        const json = await res.json()
        const response = {
          data: json,
          status: res.status,
        }

        return response
      })
      .catch((err) => {
        console.error("Error deleting data: ", err)
        throw err
      })
  },
}
