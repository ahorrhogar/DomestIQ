import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { Product } from "@/domain/catalog/types";
import {
  getProductNavigationTarget,
  trackDirectOfferNavigation,
} from "@/services/productNavigationService";

interface ProductDestinationLinkProps {
  product: Product;
  className?: string;
  children: ReactNode;
}

const ProductDestinationLink = ({
  product,
  className,
  children,
}: ProductDestinationLinkProps) => {
  const target = getProductNavigationTarget(product);

  if (target.isDirectAffiliateOffer) {
    return (
      <a
        href={target.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={() => {
          trackDirectOfferNavigation(product, target);
        }}
      >
        {children}
      </a>
    );
  }

  return (
    <Link to={target.href} className={className}>
      {children}
    </Link>
  );
};

export default ProductDestinationLink;
