# Import necessary libraries
import datetime
import logging
from firebase_functions import options, scheduler_fn, https_fn, params
from firebase_admin import initialize_app, firestore
from twilio.rest import Client

# --- Firebase and Global Options ---
# Set the region to europe-west1
options.set_global_options(region="europe-west1")
# Initialize the Firebase Admin SDK
initialize_app()
    
# --- Secret and Configuration Management ---
# Define parameters for Twilio secrets.
TWILIO_SID = params.SecretParam("TWILIO_SID")
TWILIO_TOKEN = params.SecretParam("TWILIO_TOKEN")
TWILIO_PHONE = params.SecretParam("TWILIO_PHONE")

# Lazily initialize the Twilio client
twilio_client = None


def format_phone_number(number_str: str) -> str:
        """Formats a Swedish phone number to E.164 format."""
        if not isinstance(number_str, str):
            return ""
        # Remove spaces and hyphens
        clean_number = number_str.replace(" ", "").replace("-", "")
        if clean_number.startswith('0'):
            return f"+46{clean_number[1:]}"
        # Assume it's already in a valid format if it doesn't start with 0
        return clean_number

def _execute_sms_logic():
    """
    Contains the core logic for querying bookings and sending SMS reminders.
    This function is designed to be called by different types of triggers.
    """
    global twilio_client
    logging.info("Executing SMS logic...")

    # Initialize Twilio client if it hasn't been already
    if twilio_client is None:
        sid = TWILIO_SID
        token = TWILIO_TOKEN
        from_phone_secret = TWILIO_PHONE # Get the phone number secret here too for logging
        
        # TEMPORARY DEBUGGING: Log secret values
        logging.info(f"DEBUG: TWILIO_SID received: {sid[:4]}...{sid[-4:]}") # Log partial SID
        logging.info(f"DEBUG: TWILIO_TOKEN received: {token[:4]}...{token[-4:]}") # Log partial Token
        logging.info(f"DEBUG: TWILIO_PHONE received: {from_phone_secret}") # Log full phone number, as it's less sensitive

        if sid and token:
            # Using str() just in case the resolved secret type is not a string
            twilio_client = Client(str(sid), str(token))
        else:
            logging.error("Twilio SID or Token is not available. Cannot send SMS.")
            return "Error: Twilio credentials not configured."

    from_phone = TWILIO_PHONE
    if not from_phone:
        logging.error("Twilio phone number is not configured. Cannot send SMS.")
        return "Error: Twilio phone number not configured."

    # Get the current date in YYYY-MM-DD format
    today_str = datetime.date.today().isoformat()
    logging.info(f"Running job for date: {today_str}")

    db = firestore.client()
    sent_reminders_count = 0
    errors = []

    try:
        docs = db.collection("bookings").where("date", "==", today_str).where("reminderSent", "==", False).stream()
        
        for doc in docs:
            booking = doc.to_dict()
            phone_number = booking.get("phoneNumber")
            license_plate = booking.get("licensePlate", "N/A")

            phone_number = format_phone_number(phone_number)

            if phone_number:
                try:
                    message_body = f"Påminnelse: Du har en parkering bokad idag ({license_plate})."
                    
                    message = twilio_client.messages.create(
                        body=message_body,
                        from_=str(from_phone),
                        to=phone_number
                    )
                    
                    logging.info(f"SMS sent to {phone_number}, SID: {message.sid}")
                    doc.reference.update({"reminderSent": True})
                    sent_reminders_count += 1

                except Exception as e:
                    error_message = f"Failed to send SMS to {phone_number}: {e}"
                    logging.error(error_message)
                    errors.append(error_message)
        
        if sent_reminders_count == 0 and not errors:
            logging.info("No bookings found that require a reminder.")
        else:
            logging.info(f"Successfully processed {sent_reminders_count} reminders.")
        
        if errors:
            return f"Completed with {len(errors)} errors. Check logs for details."
        else:
            return f"Successfully sent {sent_reminders_count} reminders."

    except Exception as e:
        logging.error(f"An error occurred while querying Firestore: {e}")
        return "Error: Failed to query Firestore."


# --- Cloud Functions ---

@scheduler_fn.on_schedule(
    schedule="every day 08:00",
    timezone="Europe/Stockholm",
    secrets=["TWILIO_SID", "TWILIO_TOKEN", "TWILIO_PHONE"],
)
def sendbookingreminders(event: scheduler_fn.ScheduledEvent) -> None:
    """
    The main production scheduled function that runs every morning.
    """
    logging.info("Scheduled function 'sendbookingreminders' triggered.")
    _execute_sms_logic()


@https_fn.on_request(secrets=["TWILIO_SID", "TWILIO_TOKEN", "TWILIO_PHONE"])
def testsmssend(req: https_fn.Request) -> https_fn.Response:
    """
    An HTTP-triggered function for manually testing the SMS logic locally.
    """
    logging.info("HTTP test function 'testsmssend' triggered.")
    result_message = _execute_sms_logic()
    return https_fn.Response(result_message)