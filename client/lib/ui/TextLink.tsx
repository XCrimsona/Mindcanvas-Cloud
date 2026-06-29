import React from "react";
import { Link } from "react-router-dom";

interface ILink {
  id: string;
  className: string;
  href: string;
  text: string;
  style?: any;
  target: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  onMouseEnter?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  //innerRef is optional so the peek-view (LinkPeek) can attach hover
  //listeners on the underlying anchor without forcing every other caller
  //of TextLinkFragment to thread a ref through.
  innerRef?: React.Ref<HTMLAnchorElement>;
}
export const TextLinkFragment = ({
  id,
  className,
  href,
  text,
  style,
  target,
  onClick,
  onMouseEnter,
  onMouseLeave,
  innerRef,
}: ILink) => {
  return (
    <>
      <Link
        id={id}
        target={target}
        to={href}
        className={className}
        style={style}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        ref={innerRef as any}
      >
        {text}
      </Link>
    </>
  );
};
