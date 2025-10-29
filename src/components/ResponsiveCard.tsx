import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ResponsiveCardProps {
  title: string;
  description?: string;
  image?: string;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  price?: string | number;
  originalPrice?: string | number;
  savings?: string | number;
  actions?: {
    primary?: {
      label: string;
      onClick: () => void;
      variant?: 'default' | 'outline' | 'secondary' | 'hero';
    };
    secondary?: {
      label: string;
      onClick: () => void;
      variant?: 'default' | 'outline' | 'secondary';
    };
  };
  features?: string[];
  meta?: {
    location?: string;
    duration?: string;
    rating?: number;
    reviews?: number;
  };
  className?: string;
  children?: ReactNode;
}

export function ResponsiveCard({
  title,
  description,
  image,
  badge,
  badgeVariant = 'default',
  price,
  originalPrice,
  savings,
  actions,
  features,
  meta,
  className,
  children
}: ResponsiveCardProps) {
  return (
    <Card className={cn(
      "group hover:shadow-lg transition-all duration-300 overflow-hidden bg-card",
      "flex flex-col h-full",
      className
    )}>
      {/* Image Section */}
      {image && (
        <div className="relative aspect-video sm:aspect-[4/3] overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {badge && (
            <Badge 
              variant={badgeVariant}
              className="absolute top-3 left-3 shadow-sm"
            >
              {badge}
            </Badge>
          )}
          {savings && (
            <Badge 
              variant="destructive"
              className="absolute top-3 right-3 shadow-sm"
            >
              Save {typeof savings === 'number' ? `$${savings}` : savings}
            </Badge>
          )}
        </div>
      )}

      <CardHeader className="pb-3">
        {/* Meta Info */}
        {meta && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-2">
            {meta.location && (
              <span className="flex items-center gap-1">
                📍 {meta.location}
              </span>
            )}
            {meta.duration && (
              <span className="flex items-center gap-1">
                ⏱️ {meta.duration}
              </span>
            )}
            {meta.rating && (
              <span className="flex items-center gap-1">
                ⭐ {meta.rating} {meta.reviews && `(${meta.reviews})`}
              </span>
            )}
          </div>
        )}

        <CardTitle className="text-base sm:text-lg line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </CardTitle>
        
        {description && (
          <CardDescription className="text-sm line-clamp-2 sm:line-clamp-3">
            {description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between pt-0">
        {/* Features */}
        {features && (
          <ul className="space-y-1 mb-4">
            {features.slice(0, 3).map((feature, index) => (
              <li key={index} className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                <span className="w-1 h-1 bg-primary rounded-full flex-shrink-0"></span>
                {feature}
              </li>
            ))}
            {features.length > 3 && (
              <li className="text-xs text-muted-foreground">
                +{features.length - 3} more
              </li>
            )}
          </ul>
        )}

        {children}

        {/* Pricing */}
        {(price || originalPrice) && (
          <div className="mb-4">
            <div className="flex items-baseline gap-2 flex-wrap">
              {price && (
                <span className="text-lg sm:text-xl font-bold text-primary">
                  {typeof price === 'number' ? `$${price}` : price}
                </span>
              )}
              {originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {typeof originalPrice === 'number' ? `$${originalPrice}` : originalPrice}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {actions && (
          <div className="space-y-2 sm:space-y-0 sm:flex sm:gap-2">
            {actions.primary && (
              <Button
                onClick={actions.primary.onClick}
                variant={actions.primary.variant || 'default'}
                className="w-full sm:flex-1"
                size="sm"
              >
                {actions.primary.label}
              </Button>
            )}
            {actions.secondary && (
              <Button
                onClick={actions.secondary.onClick}
                variant={actions.secondary.variant || 'outline'}
                className="w-full sm:w-auto"
                size="sm"
              >
                {actions.secondary.label}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Responsive grid component for cards
interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveGrid({ children, className }: ResponsiveGridProps) {
  return (
    <div className={cn(
      "grid gap-4 sm:gap-6",
      "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      className
    )}>
      {children}
    </div>
  );
}