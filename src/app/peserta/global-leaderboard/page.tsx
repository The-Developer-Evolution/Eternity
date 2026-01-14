import React from 'react'
import GlobalLeaderboard from '@/components/ui/GlobalLeaderboard'
import BackgroundAssetsDesktop from '@/components/common/BackgroundAssetsDesktop'
import BackgroundAssetsMobile from '@/components/common/BackgroundAssetsMobile'

export default function page() {
    return (
        <div className="overflow-hidden">
            <div className="relative min-h-screen w-screen flex flex-col gap-4 justify-center items-center py-12">
                <BackgroundAssetsDesktop />
                <BackgroundAssetsMobile />
                <div className="absolute bg-gradient-to-b from-[7%] from-[#AE00DE]/0 to-[#23328C] w-screen h-full top-0 left-0"></div>
                <GlobalLeaderboard />
            </div>
        </div>
    )
}
