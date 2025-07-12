import UserModel from '@/model/User';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/util/dbConnect';
import { User } from 'next-auth';
import { Message } from '@/model/User';
import { NextRequest } from 'next/server';
import { authOptions } from '../../auth/[...nextauth]/options';

export async function DELETE(
  request: Request,
  // { params }: { params: { messageid: string } }
) {
  // const messageId = params.messageid;
   const url = new URL(request.url);
  const segments = url.pathname.split('/');
  const messageId = segments[segments.length - 1];

   if (!messageId) {
    return Response.json(
      { success: false, message: 'Message ID is required' },
      { status: 400 }
    );
  }
  
  await dbConnect();
  const session = await getServerSession(authOptions);
  const _user: User = session?.user;
  if (!session || !_user) {
    return Response.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    const updateResult = await UserModel.updateOne(
      { _id: _user._id },
      { $pull: { messages: { _id: messageId } } }
    );

    if (updateResult.modifiedCount === 0) {
      return Response.json(
        { message: 'Message not found or already deleted', success: false },
        { status: 404 }
      );
    }

    return Response.json(
      { message: 'Message deleted', success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting message:', error);
    return Response.json(
      { message: 'Error deleting message', success: false },
      { status: 500 }
    );
  }
}