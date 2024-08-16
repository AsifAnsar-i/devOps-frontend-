import { useQuery } from "react-query";
import * as apiClient from "../api-client";
import BookingForm from "../forms/BookingForm/BookingForm";
import { useSearchContext } from "../contexts/SearchContext";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import BookingDetailsSummary from "../components/BookingDetailsSummary";
import { Elements } from "@stripe/react-stripe-js";
import { useAppContext } from "../contexts/AppContext";

const Booking = () => {
  const { stripePromise } = useAppContext();
  const search = useSearchContext();
  const { hotelId } = useParams();

  const [numberOfNights, setNumberOfNights] = useState<number>(0);

  useEffect(() => {
    if (search.checkIn && search.checkOut) {
      const nights =
        Math.abs(search.checkOut.getTime() - search.checkIn.getTime()) /
        (1000 * 60 * 60 * 24);

      setNumberOfNights(Math.ceil(nights));
    }
  }, [search.checkIn, search.checkOut]);

  const {
    data: currentUser,
    isLoading: isUserLoading,
    error: userError,
  } = useQuery("fetchCurrentUser", apiClient.fetchCurrentUser);

  const description = `Booking for ${numberOfNights} nights at hotel ${hotelId}`;

  const address = "Faizabad,India";
  const name = "Asif";
  const {
    data: paymentIntentData,
    isLoading: isPaymentIntentLoading,
    error: paymentIntentError,
  } = useQuery(
    "createPaymentIntent",
    () =>
      apiClient.createPaymentIntent(
        hotelId as string,
        numberOfNights.toString(),
        description,
        name,
        address
      ),
    {
      enabled: !!hotelId && numberOfNights > 0,
    }
  );

  const {
    data: hotel,
    isLoading: isHotelLoading,
    error: hotelError,
  } = useQuery(
    "fetchHotelByID",
    () => apiClient.fetchHotelById(hotelId as string),
    {
      enabled: !!hotelId,
    }
  );

  if (isHotelLoading || isUserLoading || isPaymentIntentLoading) {
    return <div>Loading...</div>;
  }

  if (hotelError || userError || paymentIntentError) {
    return <div>Error loading data. Please try again later.</div>;
  }

  if (!hotel) {
    return <div>No hotel data available.</div>;
  }

  return (
    <div className="grid md:grid-cols-[1fr_2fr]">
      <BookingDetailsSummary
        checkIn={search.checkIn}
        checkOut={search.checkOut}
        adultCount={search.adultCount}
        childCount={search.childCount}
        numberOfNights={numberOfNights}
        hotel={hotel}
      />
      {currentUser && paymentIntentData && (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret: paymentIntentData.clientSecret,
          }}
        >
          <BookingForm
            currentUser={currentUser}
            paymentIntent={paymentIntentData}
          />
        </Elements>
      )}
    </div>
  );
};

export default Booking;
