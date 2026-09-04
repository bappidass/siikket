import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  startIndex: number;
  endIndex: number;
  totalItems: number;
}

const TablePagination = ({
  currentPage,
  totalPages,
  onPageChange,
  startIndex,
  endIndex,
  totalItems,
}: TablePaginationProps) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } 
    else if (currentPage <= 3) {
      for (let i = 1; i <= Math.min(4, totalPages); i++) {
        pages.push(i);
      }
      if (totalPages > 4) {
        pages.push(-1);
        pages.push(totalPages);
      }
    } 
    else if (currentPage >= totalPages - 2) {
      pages.push(1);
      pages.push(-1); 
      for (let i = Math.max(totalPages - 3, 2); i <= totalPages; i++) {
        pages.push(i);
      }
    } 
    else {
      pages.push(1);
      pages.push(-1); 
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pages.push(i);
      }
      pages.push(-2); 
      pages.push(totalPages);
    }
    
    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
      <div className="text-sm text-muted-foreground">
        Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
        <span className="font-medium">{endIndex}</span> of{" "}
        <span className="font-medium">{totalItems}</span> results
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center">
          {getPageNumbers().map((pageNum, index) => {
            if (pageNum === -1 || pageNum === -2) {
              return (
                <span key={`ellipsis-${index}`} className="px-1.5 py-0.5">
                  ...
                </span>
              );
            }
            
            return (
              <Button
                key={`page-${pageNum}`}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                className="h-8 w-8"
                onClick={() => onPageChange(pageNum)}
              >
                {pageNum}
              </Button>
            );
          })}
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default TablePagination;