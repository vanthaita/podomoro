import { type HTMLAttributes } from "react";

interface SoundCloudProps extends HTMLAttributes<HTMLIFrameElement> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;

  link: string;
  wide?: boolean;
  width?: number | string;
  height?: number | string;
  frameBorder?: number | string;
  allow?: string;
  color?: string;
  autoPlay?: boolean;
  hideRelated?: boolean;
  showComments?: boolean;
  showUser?: boolean;
  showReposts?: boolean;
  visual?: boolean;
}

export const SoundCloud = ({
  link,
  style = {},
  wide = false,
  width = wide ? "100%" : 300,
    height = wide ? 166 : 166,
    frameBorder = 0,
    allow = "autoplay",
    color = "#ff5500",
    autoPlay = false,
    hideRelated = true,
    showComments = false,
    showUser = true,
    showReposts = false,
    visual = true,
    ...props
}: SoundCloudProps) => {
  const url = new URL(link);
  const trackPath = url.pathname;

  let trackUrl = `https://w.soundcloud.com/player/?url=https%3A//soundcloud.com${trackPath}&color=${encodeURIComponent(color)}&auto_play=${autoPlay}&hide_related=${hideRelated}&show_comments=${showComments}&show_user=${showUser}&show_reposts=${showReposts}&visual=${visual}`;

  if (trackPath.includes('/sets/')) {
    trackUrl = `https://w.soundcloud.com/player/?url=https%3A//soundcloud.com${trackPath}&color=${encodeURIComponent(color)}&auto_play=${autoPlay}&hide_related=${hideRelated}&show_comments=${showComments}&show_user=${showUser}&show_reposts=${showReposts}&visual=${visual}`;
  }

  return (
    <div style={{ width: '100%', maxWidth: width === "100%" ? '100%' : typeof width === 'number' ?  `${width}px` : width}} className="max-w-full">
      <iframe
        title="SoundCloud Web Player"
        width="100%"
        height={height}
        scrolling="no"
        frameBorder={frameBorder}
        allow={allow}
        src={trackUrl}
        style={{
          borderRadius: 8,
          ...style,
            display: "block"
        }}
        {...props}
      />
    </div>
  );
};