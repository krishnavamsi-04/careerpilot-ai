
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const preferences = await request.json()

    const apiUrl =
      process.env.COLLEGE_RECOMMENDATION_API_URL ||
      'http://127.0.0.1:8000'

    const response = await fetch(`${apiUrl}/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferences),
      cache: 'no-store',
    })

    const data = await response.json()

    return NextResponse.json(data, {
      status: response.status,
    })
  } catch (error) {
    console.error('College recommendation API error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Could not connect to the recommendation service.',
      },
      { status: 500 }
    )
  }
}
