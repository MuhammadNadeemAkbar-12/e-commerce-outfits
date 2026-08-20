

import axios from '@/api/axios'

export default {
    async placeOrder(payload) {
        try {
            const res = await axios.post('/customer/checkout', payload)
            return res.data
        } catch (error) {
            console.error('checkout.placeOrder error', error?.response?.data ?? error)
            throw error?.response?.data ?? error
        }
    }
}

