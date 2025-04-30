
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table";

const EmptyMenuTable = () => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead className="w-[100px]">Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="w-[200px]">Category</TableHead>
            <TableHead className="w-[100px]">Price</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={6} className="h-24 text-center">
              No menu items found. Add your first menu item!
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default EmptyMenuTable;
