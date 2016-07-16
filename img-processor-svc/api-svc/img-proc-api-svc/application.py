import logging

from bottle import Bottle, run, request
import pika


logger = logging.getLogger('img-proc-api-svc')
logger.setLevel(logging.DEBUG)
logger.propagate = False
# create file handler
#fh = logging.FileHandler('img-proc-api-svc.log')
#fh.setLevel(logging.DEBUG)
# create console handler
ch = logging.StreamHandler()
ch.setLevel(logging.DEBUG)
# create formatter and add it to the handlers
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
#fh.setFormatter(formatter)
ch.setFormatter(formatter)
# add the handlers to the logger
#logger.addHandler(fh)
logger.addHandler(ch)

QUEUE_NAME = 'task_queue'

app = Bottle()


@app.route('/jobs', method='POST')
def post_jobs():
    logger.info('Processing POST /jobs')
    data = request.json
    logger.info('body: {0}'.format(data))

    connection = pika.BlockingConnection(pika.ConnectionParameters('rabbitmq'))
    channel = connection.channel()

    # Creates the queue
    channel.queue_declare(queue=QUEUE_NAME)

    channel.basic_publish(exchange='',
                          routing_key=QUEUE_NAME,
                          body=data,
                          properties=pika.BasicProperties(
                              delivery_mode=2,  # make message persistent
                          ))

logger.info('Starting Image Processor API Service...')
run(app, host='0.0.0.0', port=8082, reloader=True)
