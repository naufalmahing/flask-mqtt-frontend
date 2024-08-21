import React, { createContext, useEffect, useState } from 'react'

import mqtt from 'mqtt'

import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'
import httpClient from '../../httpClient'

export const QosOption = createContext([])
// https://github.com/mqttjs/MQTT.js#qos
const qosOption = [
  {
    label: '0',
    value: 0,
  },
  {
    label: '1',
    value: 1,
  },
  {
    label: '2',
    value: 2,
  },
]

const chartOption = {
  scales: {
    // x: {
    //   ticks: {
    //     maxRotation: 45,
    //     minRotation: 45
    //   }
    // }
  }
}


function separateKeysToArrays(objects) {
  const result = {};

  objects.forEach(obj => {
    Object.keys(obj).forEach(key => {
      if (!result[key]) {
        result[key] = [];
      }
      result[key].push(obj[key]);
    });
  });

  return result;
}


const HookMqtt = () => {
  const [client, setClient] = useState(null)
  const [isSubed, setIsSub] = useState(false)
  const [payload, setPayload] = useState({})
  const [connectStatus, setConnectStatus] = useState('Connect')

  // variables to get data from backend
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const Navigate = useNavigate();

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Humidity (RH)',
        data: [data],
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
        layout: {
          yaxis: {'title': 'Empty'}, 'range': [50, 100]
        }
      },
    ],
  });

  // connect
  const mqttConnect = async (host, mqttOption) => {
    setConnectStatus('Connecting')
    /**
     * if protocol is "ws", connectUrl = "ws://broker.emqx.io:8083/mqtt"
     * if protocol is "wss", connectUrl = "wss://broker.emqx.io:8084/mqtt"
     *
     * /mqtt: MQTT-WebSocket uniformly uses /path as the connection path,
     * which should be specified when connecting, and the path used on EMQX is /mqtt.
     *
     * for more details about "mqtt.connect" method & options,
     * please refer to https://github.com/mqttjs/MQTT.js#mqttconnecturl-options
     */

      const defOption = {
        // ws or wss
        protocol: 'tcp',
        host: 'broker.hivemq.com',
        clientId: 'emqx_react_' + Math.random().toString(16).substring(2, 8),
        // ws -> 8083; wss -> 8084
        port: 8083,
        /**
         * By default, EMQX allows clients to connect without authentication.
         * https://docs.emqx.com/en/enterprise/v4.4/advanced/auth.html#anonymous-login
         */
        username: 'emqx_test',
        password: 'emqx_test',
      }
      const mqttClient = await mqtt.connect("ws://broker.hivemq.com:8000/mqtt")
      setClient(mqttClient)
  }

  useEffect(() => {
    if (client) {
      // https://github.com/mqttjs/MQTT.js#event-connect
      client.on('connect', () => {
        setConnectStatus('Connected')
        console.log('connection successful')
        mqttSub({})
      })

      // https://github.com/mqttjs/MQTT.js#event-error
      client.on('error', (err) => {
        console.error('Connection error: ', err)
        client.end()
      })

      // https://github.com/mqttjs/MQTT.js#event-reconnect
      client.on('reconnect', () => {
        setConnectStatus('Reconnecting')
      })

      // https://github.com/mqttjs/MQTT.js#event-message
      client.on('message', (topic, message) => {
        const payload = { topic, message: message.toString() }
        setPayload(payload)
        
        const jsonObject = JSON.parse(message)

        const timedate = []
        const humidityValues = []

        if (jsonObject.data) {
          for (let i = 0; i < jsonObject.data.length; i++) {
            timedate.push(jsonObject.data[i].timedate)
            humidityValues.push(jsonObject.data[i].humidity)
          }
        }
        
        console.log(jsonObject)

        setChartData((prevData) => {
          
          return {
            ...prevData,
            labels: timedate,
            datasets: [
              {
                ...prevData.datasets[0],
                data: humidityValues,
              },
            ],
          }

        })
        
        console.log(`received message: ${message} from topic: ${topic}`)

        // create notification
        console.log(chartData.datasets[0].data.slice(-1))
        console.log(humidityValues.slice(-1))
        new Notification('Humidity now is ' + humidityValues.slice(-1))
       
      })
    }

  }, [client])

  // get user
  useEffect(() => {
      httpClient.get('http://localhost:8000/get-user')
          .then((response) => {
            if (response.data.code === 401) {
              Navigate('/login')
            }
          })
  }, [])

  // display data from getting it the first time from be
  useEffect(() => {
    httpClient.get('http://localhost:8000/get-data')
        .then((response) => {
            setData(response.data);
            setLoading(false);  
            
            console.log(response.data)

            setChartData((prevData) => {      
              const latest10Data = response.data.length > 10 ? response.data.slice(-10) : response.data 

              const result = separateKeysToArrays(latest10Data)
              const updatedLabels = result.timedate
              const updatedData = result.humidity

              return {
                ...prevData,
                labels: updatedLabels,
                datasets: [
                  {
                    ...prevData.datasets[0],
                    data: updatedData,
                  },
                ],
              };
            });
        })
        .catch((error) => {
            setError(error);
            setLoading(false);
        });
  }, []);

  // disconnect
  // https://github.com/mqttjs/MQTT.js#mqttclientendforce-options-callback
  const mqttDisconnect = () => {
    if (client) {
      try {
        client.end(false, () => {
          setConnectStatus('Connect')
          console.log('disconnected successfully')
        })
      } catch (error) {
        console.log('disconnect error:', error)
      }
    }
  }

  // publish message
  // https://github.com/mqttjs/MQTT.js#mqttclientpublishtopic-message-options-callback
  const mqttPublish = (context) => {
    if (client) {
      // topic, QoS & payload for publishing message
      const { topic, qos, payload } = context
      client.publish(topic, payload, { qos }, (error) => {
        if (error) {
          console.log('Publish error: ', error)
        }
      })
    }
  }

  // subscribe
  const mqttSub = (subscription) => {
    if (client) {
      // topic & QoS for MQTT subscribing
      // const { topic, qos } = subscription

      const topic = '/jarren/mqtt'
      
      // subscribe topic
      // https://github.com/mqttjs/MQTT.js#mqttclientsubscribetopictopic-arraytopic-object-options-callback
      client.subscribe("/jarren/mqtt", 0, (error) => {
        if (error) {
          console.log('Subscribe to topics error', error)
          return
        }
        console.log(`Subscribe to topics: ${topic}`)
        setIsSub(true)
      })
    }
  }

  // unsubscribe topic
  // https://github.com/mqttjs/MQTT.js#mqttclientunsubscribetopictopic-array-options-callback
  const mqttUnSub = (subscription) => {
    if (client) {
      const { topic, qos } = subscription
      client.unsubscribe(topic, { qos }, (error) => {
        if (error) {
          console.log('Unsubscribe error', error)
          return
        }
        console.log(`unsubscribed topic: ${topic}`)
        setIsSub(false)
      })
    }
  }
  
  useEffect(() => {
    mqttConnect("", {})
    Notification.requestPermission()
  }, []);
  
  const clearSession = () => {
    httpClient.get('http://localhost:8000/logout')
        .then((response) => {
          if (response.data.code === 200) {
            Navigate('/login')
          }
        })
  }
  return (
    <>
      <Link onClick={clearSession} class='hover:underline'>Logout</Link>
      
      <h2 class='text-5xl font-bold'>Humidity</h2>
      <h3 class='text-5xl font-bold'>{chartData.datasets[0].data.slice(-1)}</h3>
      <div class='sm:mx-[4rem]'>
        <Line data={chartData} options={chartOption} />
      </div>
    </>
  )
}

export default HookMqtt
