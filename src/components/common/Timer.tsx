'use client'
import React from 'react'
import { useState, useEffect } from 'react'

export default function Timer() {
    const [time, setTime] = useState({ minutes: 0, seconds: 0 })

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(prev => {
                let { minutes, seconds } = prev
                seconds++
                if (seconds === 60) {
                    seconds = 0
                    minutes++
                }
                return { minutes, seconds }
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    const formatTime = (num: number) => String(num).padStart(2, '0')

    return (
        <div className="rounded-2xl bg-black/40 px-8 py-2 shadow-2xl">
            <div className="text-xl font-bold text-white tracking-wider">
                {formatTime(time.minutes)}:{formatTime(time.seconds)}
            </div>
        </div>
    )
}