import { UserRole } from "./types/auth"

export const api: any = {
  get: async (route: string): Promise<any> => {
    const url = `${process.env.REACT_APP_API_URL as string}${route}`

    return await fetch(url, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
      },
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
      },
      body: JSON.stringify(payload),
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
      },
      body: JSON.stringify(data),
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
        console.error("Error posting data: ", err)
        throw err
      })
  },

  delete: async (route: string, data: any): Promise<any> => {
    const url = `${process.env.REACT_APP_API_URL as string}${route}`

    return await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
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

export const checkUserRole = async (authId: string) => {
  try {
    // First check volunteers table
    const volunteerResponse = await api.get(`/volunteer/get-volunteer-by-auth/${authId}`)
    if (volunteerResponse.status === 200) {
      return UserRole.VOLUNTEER
    }

    // Then check organizations table
    const orgResponse = await api.get(`/organization/get-organization-by-auth/${authId}`)
    if (orgResponse.status === 200) {
      return UserRole.ORGANIZATION
    }

    throw new Error('User not found in either table')
  } catch (error) {
    console.error('Error checking user role:', error)
    throw error
  }
}
