import { useSettings } from "@/context/SettingContext"
import useWindowDimensions from "@/hooks/useWindowDimensions"

function CoffeeCorner() {
    const { showGitHubCorner } = useSettings()
    const { width } = useWindowDimensions()

    return (
        <a
            href="http://attendance-dashboard-gilt.vercel.app/"
            className="github-corner"
            aria-label="Coffee Corner"
            target="_blank"
            rel="noreferrer"
            style={{
                display: showGitHubCorner && width > 640 ? "block" : "none",
            }}
        >
            <svg
                width="150"
                height="100"
                viewBox="0 0 512 512"
                className="absolute right-0 top-0 z-10 border-none bg-primary text-gray-900 dark:text-gray-100"
                aria-hidden="true"
                style={{
                    color: "#151513",
                    transform: "rotate(45deg) translate(12%,-80%) scale(0.8)", // triangle unchanged
                }}
            >
                <g
                    style={{
                        transform: "rotate(-45deg) translate(0%,50%)",
                        transformOrigin: "bottom",
                    }}
                >
                    {/* Inner <g> for coffee cup, scaled smaller */}
                    <g
                        style={{
                            transform: "translate(20%, -10%) scale(0.4)", // smaller cup
                            transformOrigin: "center",
                        }}
                    >
                        <path
                            d="M416 96H96c-17.673 0-32 14.327-32 32v64c0 88.224 71.776 160 160 160h32c88.224 0 160-71.776 160-160v-64c0-17.673-14.327-32-32-32zm-16 64c0 79.529-64.471 144-144 144h-32c-79.529 0-144-64.471-144-144v-32h320v32zM128 416h256v32H128v-32z"
                            fill="currentColor"
                        ></path>
                    </g>
                </g>
            </svg>
        </a>
    )
}

export default CoffeeCorner
