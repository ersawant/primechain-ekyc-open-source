import logging

from sawtooth_processor_test.transaction_processor_test_case \
    import TransactionProcessorTestCase
from wallet.simplewallet_message_factory import SimplewalletMessageFactory

LOGGER = logging.getLogger(__name__)


class TestSimplewallet(TransactionProcessorTestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()

        cls.wallet = SimplewalletMessageFactory()
        cls.public_key = cls.wallet.get_public_key()

    # send transactions
    def send_transaction(self, action, value):
        factory = self.wallet

        self.validator.send(
            factory.create_tp_process_request(
                action, value))

    # set expectations
    def expect_ok(self):
        self.expect_tp_response('OK')

    def expect_invalid(self):
        self.expect_tp_response('INVALID_TRANSACTION')

    def expect_tp_response(self, response):
        self.validator.expect(
            self.wallet.create_tp_response(
                response))

    # invalid inputs
    def test_no_action(self):
        self.send_transaction('', 1)

        self.expect_invalid()

    def test_invalid_action(self):
        self.send_transaction('magic', 2)

        self.expect_invalid()
