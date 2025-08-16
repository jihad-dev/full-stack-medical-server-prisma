import axios from "axios";
import { prisma } from "../../../Shared/prisma";
import { SSlservices } from "../SSL/ssl.service";
import {  PaymentStatus } from "../../../generated/prisma";
const initPayment = async (appointmentId: string) => {
  const paymentData = await prisma.payment.findFirstOrThrow({
    where: {
      appointmentId,
    },
    include: {
      appointment: {
        include: {
          patient: true,
        },
      },
    },
  });
  const initPaymentInfo = {
    amount: paymentData?.amount,
    transactionId: paymentData?.transactionId,
    name: paymentData?.appointment?.patient?.name,
    email: paymentData?.appointment?.patient?.email,
    contactNumber: paymentData?.appointment?.patient?.contactNumber,
    address:paymentData?.appointment?.patient?.address
  };
  const result = await SSlservices.initPayment(initPaymentInfo);
  return {
    paymentUrl: result?.GatewayPageURL,
  };
};
const validatePayment = async (payload: any) => {
  if (!payload || !payload.status || !(payload.status === 'VALID')) {
      return {
          message: "Invalid Payment!"
      }
  }

  const response = await SSlservices.validatePayment(payload);

  if (response?.status !== 'VALID') {
      return {
          message: "Payment Failed!"
      }
  }

  await prisma.$transaction(async (tx) => {
    const updatedPaymentData = await tx.payment.update({
      where: {
        transactionId: response.tran_id,
      },
      data: {
        status: PaymentStatus.PAID,
        paymentGatewayData: response,
      },
    });

    await tx.appointment.update({
      where: {
        id: updatedPaymentData.appointmentId,
      },
      data: {
        paymentStatus: PaymentStatus.PAID,
      },
    });
  });

  return {
    message: "Payment success!",
  };
};

export const paymentServices = {
  initPayment,
  validatePayment,
};
